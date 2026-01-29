"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, Phone, Mail, Send, Bot, User, 
  Loader2, AlertCircle, Plus, ChevronRight 
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useChatSessions,
  useCreateChatSession,
  useChatMessages,
  useSendChatMessage,
  useEscalateChat,
} from "@/lib/api/hooks";

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'PATIENT' | 'BOT' | 'AGENT';
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  status: 'ACTIVE' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  subject?: string;
  createdAt: string;
  lastMessageAt?: string;
}

export default function SupportPage() {
  const t = useTranslations("patient.support");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showSessions, setShowSessions] = useState(true);

  // API hooks
  const { data: sessionsData, isLoading: sessionsLoading } = useChatSessions();
  const { mutate: createSession, isPending: creatingSession } = useCreateChatSession();
  const { 
    data: messagesData, 
    isLoading: messagesLoading,
    refetch: refetchMessages 
  } = useChatMessages(activeSessionId || '');
  const { mutate: sendMessage, isPending: sendingMessage } = useSendChatMessage();
  const { mutate: escalateChat, isPending: escalating } = useEscalateChat();

  const sessions = (sessionsData?.data || []) as ChatSession[];
  const messages = (messagesData?.data || []) as ChatMessage[];
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages in active session
  useEffect(() => {
    if (!activeSessionId) return;
    const interval = setInterval(() => {
      refetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSessionId, refetchMessages]);

  const handleCreateSession = () => {
    createSession({ subject: t("chat.newConversation") }, {
      onSuccess: (session) => {
        setActiveSessionId((session as { id: string }).id);
        setShowSessions(false);
        toast.success(t("chat.sessionCreated"));
      },
      onError: () => {
        toast.error(t("chat.createError"));
      },
    });
  };

  const handleSendMessage = () => {
    if (!input.trim() || !activeSessionId) return;
    
    sendMessage({
      sessionId: activeSessionId,
      content: input,
    }, {
      onSuccess: () => {
        setInput("");
      },
      onError: () => {
        toast.error(t("chat.sendError"));
      },
    });
  };

  const handleEscalate = () => {
    if (!activeSessionId) return;
    escalateChat(activeSessionId, {
      onSuccess: () => {
        toast.success(t("chat.escalated"));
      },
      onError: () => {
        toast.error(t("chat.escalateError"));
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'ESCALATED': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {activeSession ? activeSession.subject || t("chat.title") : t("chat.title")}
                  </CardTitle>
                  {activeSession && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(activeSession.status)}>
                        {t(`chat.status.${activeSession.status.toLowerCase()}`)}
                      </Badge>
                      {activeSession.status === 'ACTIVE' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEscalate}
                          disabled={escalating}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {t("chat.escalate")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {activeSessionId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setActiveSessionId(null);
                        setShowSessions(true);
                      }}
                    >
                      {t("chat.backToList")}
                    </Button>
                  )}
                  <Button size="sm" onClick={handleCreateSession} disabled={creatingSession}>
                    {creatingSession ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">{t("chat.new")}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {!activeSessionId && showSessions ? (
                /* Sessions List */
                <div className="flex-1 overflow-y-auto">
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                      <p>{t("chat.noSessions")}</p>
                      <Button className="mt-4" onClick={handleCreateSession}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("chat.startNew")}
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {sessions.map((session: ChatSession) => (
                        <button
                          key={session.id}
                          className="w-full p-4 text-left hover:bg-neutral-50 transition-colors flex items-center justify-between"
                          onClick={() => {
                            setActiveSessionId(session.id);
                            setShowSessions(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{session.subject || t("chat.untitled")}</p>
                            <p className="text-sm text-neutral-500">
                              {new Date(session.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.status)}>
                              {t(`chat.status.${session.status.toLowerCase()}`)}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-neutral-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Messages */
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                        <Bot className="w-12 h-12 mb-3 opacity-50" />
                        <p>{t("chat.startConversation")}</p>
                      </div>
                    ) : (
                      messages.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === "PATIENT" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${
                              message.senderType === "PATIENT" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.senderType === "PATIENT"
                                  ? "bg-primary-100 text-primary-600"
                                  : message.senderType === "BOT"
                                  ? "bg-neutral-100 text-neutral-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {message.senderType === "PATIENT" ? (
                                <User className="w-4 h-4" />
                              ) : message.senderType === "BOT" ? (
                                <Bot className="w-4 h-4" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                message.senderType === "PATIENT"
                                  ? "bg-primary-600 text-white"
                                  : "bg-neutral-100 text-neutral-900"
                              }`}
                            >
                              {message.senderType === "AGENT" && (
                                <p className="text-xs font-medium text-green-600 mb-1">
                                  {t("chat.agent")}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderType === "PATIENT"
                                    ? "text-primary-200"
                                    : "text-neutral-500"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 p-4 border-t">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("chat.placeholder")}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      disabled={!activeSessionId || activeSession?.status === 'CLOSED'}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!input.trim() || sendingMessage || !activeSessionId || activeSession?.status === 'CLOSED'}
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-neutral-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{t("contact.phone")}</p>
                  <p className="text-sm text-neutral-500">01 23 45 67 89</p>
                </div>
              </a>
              <a
                href="mailto:support@capmobilite.fr"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-neutral-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{t("contact.email")}</p>
                  <p className="text-sm text-neutral-500">support@capmobilite.fr</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("hours.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("hours.weekdays")}</span>
                  <span>9h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("hours.saturday")}</span>
                  <span>9h - 12h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("hours.sunday")}</span>
                  <span>{t("hours.closed")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary-900">{t("faq.title")}</h3>
              <p className="text-sm text-primary-700 mt-1">{t("faq.description")}</p>
              <Button variant="outline" size="sm" className="mt-3">
                {t("faq.button")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
