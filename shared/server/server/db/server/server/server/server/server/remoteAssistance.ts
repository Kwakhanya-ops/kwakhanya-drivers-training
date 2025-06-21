import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { z } from 'zod';

export enum MessageType {
  JOIN_AS_USER = 'JOIN_AS_USER',
  JOIN_AS_ADMIN = 'JOIN_AS_ADMIN',
  ADMIN_JOINED = 'ADMIN_JOINED',
  ADMIN_LEFT = 'ADMIN_LEFT',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  ERROR = 'ERROR',
}

const messageSchema = z.object({
  type: z.nativeEnum(MessageType),
  payload: z.any(),
  sessionId: z.string().optional(),
  userId: z.number().optional(),
  adminId: z.number().optional(),
});

interface UserClient {
  ws: WebSocket;
  userId?: number;
  userName: string;
  userEmail?: string;
  sessionId: string;
  page: string;
}

interface AdminClient {
  ws: WebSocket;
  adminId: number;
  adminName: string;
  sessions: Set<string>;
}

export class RemoteAssistanceServer {
  private wss: WebSocketServer;
  private adminClients: Map<WebSocket, AdminClient> = new Map();
  private userClients: Map<WebSocket, UserClient> = new Map();
  private sessionToUsers: Map<string, Set<WebSocket>> = new Map();
  private sessionToAdmins: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    console.log('Initializing RemoteAssistanceServer with path: /ws/assistance');
    this.setupWebSocketServer(server);
    console.log('Remote assistance server initialized');
  }

  private setupWebSocketServer(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/assistance',
      verifyClient: (info) => {
        console.log('WebSocket connection attempt:', info.req.url);
        return true;
      }
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log(`Remote assistance server initialized with 0 active connections`);
  }

  private handleMessage(ws: WebSocket, message: any) {
    try {
      const validatedMessage = messageSchema.parse(message);
      
      switch (validatedMessage.type) {
        case MessageType.JOIN_AS_USER:
          this.handleUserJoin(ws, validatedMessage.payload);
          break;
        case MessageType.JOIN_AS_ADMIN:
          this.handleAdminJoin(ws, validatedMessage.payload);
          break;
        case MessageType.CHAT_MESSAGE:
          this.handleChatMessage(ws, validatedMessage.payload);
          break;
        default:
          console.log('Unknown message type:', validatedMessage.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError(ws, 'Invalid message');
    }
  }

  private handleUserJoin(ws: WebSocket, payload: any) {
    const { sessionId, userName, userEmail, userId, page } = payload;
    
    const userClient: UserClient = {
      ws,
      userId,
      userName,
      userEmail,
      sessionId,
      page: page || 'unknown',
    };

    this.userClients.set(ws, userClient);

    // Add to session mapping
    if (!this.sessionToUsers.has(sessionId)) {
      this.sessionToUsers.set(sessionId, new Set());
    }
    this.sessionToUsers.get(sessionId)!.add(ws);

    // Notify all admins about new user
    this.broadcastToAdmins({
      type: MessageType.USER_JOINED,
      payload: {
        sessionId,
        userName,
        userEmail,
        userId,
        page: userClient.page,
      },
    });

    console.log(`User joined: ${userName} in session ${sessionId}`);
  }

  private handleAdminJoin(ws: WebSocket, payload: any) {
    const { adminId, adminName } = payload;
    
    const adminClient: AdminClient = {
      ws,
      adminId,
      adminName,
      sessions: new Set(),
    };

    this.adminClients.set(ws, adminClient);

    // Send current active sessions to the new admin
    const activeSessions = Array.from(this.sessionToUsers.keys()).map(sessionId => {
      const users = Array.from(this.sessionToUsers.get(sessionId) || [])
        .map(userWs => this.userClients.get(userWs))
        .filter(Boolean);
      
      return {
        sessionId,
        users: users.map(user => ({
          userName: user!.userName,
          userEmail: user!.userEmail,
          userId: user!.userId,
          page: user!.page,
        })),
      };
    });

    this.sendToClient(ws, {
      type: MessageType.ADMIN_JOINED,
      payload: { activeSessions },
    });

    console.log(`Admin joined: ${adminName}`);
  }

  private handleChatMessage(ws: WebSocket, payload: any) {
    const { message, sessionId, isFromAdmin } = payload;
    
    if (isFromAdmin) {
      // Admin sending message to users in session
      const adminClient = this.adminClients.get(ws);
      if (!adminClient) return;

      const sessionUsers = this.sessionToUsers.get(sessionId);
      if (sessionUsers) {
        sessionUsers.forEach(userWs => {
          this.sendToClient(userWs, {
            type: MessageType.CHAT_MESSAGE,
            payload: {
              message,
              senderName: adminClient.adminName,
              isFromAdmin: true,
              timestamp: new Date().toISOString(),
            },
          });
        });
        console.log(`Admin ${adminClient.adminName} sent message to session ${sessionId}: ${message}`);
      }
    } else {
      // User sending message to admins
      const userClient = this.userClients.get(ws);
      if (!userClient) return;

      this.broadcastToAdmins({
        type: MessageType.CHAT_MESSAGE,
        payload: {
          message,
          senderName: userClient.userName,
          sessionId: userClient.sessionId,
          isFromAdmin: false,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`User ${userClient.userName} sent message: ${message}`);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    if (this.adminClients.has(ws)) {
      const adminClient = this.adminClients.get(ws)!;
      this.adminClients.delete(ws);
      console.log(`Admin disconnected: ${adminClient.adminName}`);
    }

    if (this.userClients.has(ws)) {
      const userClient = this.userClients.get(ws)!;
      this.userClients.delete(ws);
      
      // Remove from session mapping
      const sessionUsers = this.sessionToUsers.get(userClient.sessionId);
      if (sessionUsers) {
        sessionUsers.delete(ws);
        if (sessionUsers.size === 0) {
          this.sessionToUsers.delete(userClient.sessionId);
        }
      }

      // Notify admins
      this.broadcastToAdmins({
        type: MessageType.USER_LEFT,
        payload: {
          sessionId: userClient.sessionId,
          userName: userClient.userName,
        },
      });

      console.log(`User disconnected: ${userClient.userName}`);
    }
  }

  private broadcastToAdmins(message: any) {
    this.adminClients.forEach((adminClient) => {
      this.sendToClient(adminClient.ws, message);
    });
  }

  private sendToClient(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.sendToClient(ws, {
      type: MessageType.ERROR,
      payload: { message },
    });
  }
}
