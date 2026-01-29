"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { MessageCircle, Phone, Mail, Send, Bot, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function SupportPage() {
  const t = useTranslations("patient.support");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      content: "Bonjour ! Je suis l'assistant virtuel de CapMobilité. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        content:
          "Merci pour votre message. Un conseiller va prendre en charge votre demande dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ ou nous appeler au 01 23 45 67 89.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
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
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t("chat.title")}
              </CardTitle>
              <CardDescription>{t("chat.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-primary-100 text-primary-600"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-100 text-neutral-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-primary-200"
                              : "text-neutral-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
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
