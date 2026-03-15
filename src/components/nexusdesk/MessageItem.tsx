import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, MoreHorizontal, Smile, Pin, Bookmark, ClipboardCheck, ExternalLink, CheckCircle2, Pencil, Trash2, X, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LinkComprovacaoSheet } from "./LinkComprovacaoSheet";
import { useNavigate } from "react-router-dom";

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userInitials: string;
  userRole?: string;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  reactions?: Reaction[];
  replyCount?: number;
  isBot?: boolean;
  isPinned?: boolean;
  attachments?: { url: string; name?: string }[];
}

interface LinkedEvidence {
  entityType: string;
  entityId: string;
}

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onPin?: (messageId: string, currentlyPinned: boolean) => void;
  onBookmark?: (messageId: string) => void;
  isBookmarked?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

const quickReactions = ["👍", "❤️", "🎉", "🚀", "👀", "✅"];

function hasComprovacaoTag(content: string): boolean {
  return /(?:^|\s)#comprova[çc][aã]o\b/i.test(content);
}

function hasMediaAttachments(message: Message): boolean {
  return !!(message.attachments && message.attachments.length > 0);
}

function shouldShowComprovacao(message: Message): boolean {
  return hasComprovacaoTag(message.content) || hasMediaAttachments(message);
}

export function MessageItem({ message, currentUserId, onReaction, onReply, onPin, onBookmark, isBookmarked, onEdit, onDelete }: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkSheetOpen, setLinkSheetOpen] = useState(false);
  const [linkedEvidence, setLinkedEvidence] = useState<LinkedEvidence | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const isOwn = currentUserId === message.userId;

  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const showComprovacao = shouldShowComprovacao(message);

  const handleLinked = (entityType: string, entityId: string) => {
    setLinkedEvidence({ entityType, entityId });
  };

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  useEffect(() => {
    if (isEditing && editRef.current) {
      const textarea = editRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [isEditing, editContent]);

  return (
    <>
      <article
        className="group relative py-2 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-lg transition-colors"
        style={{
          backgroundColor: isHovered ? 'rgba(39, 39, 42, 0.3)' : 'transparent',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
      >
        {/* Pinned indicator */}
        {message.isPinned && (
          <div className="flex items-center gap-1 text-xs mb-1 ml-10 sm:ml-12" style={{ color: '#71717A' }}>
            <Pin className="h-3 w-3" />
            <span>Mensagem fixada</span>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 mt-0.5">
            <AvatarFallback
              className="text-[10px] sm:text-xs font-semibold"
              style={{
                backgroundColor: message.isBot ? '#7C2D12' : '#27272A',
                color: message.isBot ? '#FAFAFA' : '#A1A1AA',
              }}
            >
              {message.userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold" style={{ color: message.isBot ? '#EA580C' : '#FAFAFA' }}>
                {message.userName}
              </span>
              {message.isBot && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(194, 65, 12, 0.2)', color: '#EA580C' }}>
                  BOT
                </span>
              )}
              {message.userRole && !message.isBot && (
                <span className="hidden sm:inline text-xs" style={{ color: '#52525B' }}>{message.userRole}</span>
              )}
              <span className="text-[11px] sm:text-xs" style={{ color: '#52525B' }}>{formattedTime}</span>
              {message.editedAt && (
                <span className="text-[10px]" style={{ color: '#52525B' }}>(editado)</span>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="mt-1">
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="w-full resize-none bg-transparent outline-none text-sm rounded-lg p-2"
                  style={{ backgroundColor: '#27272A', color: '#FAFAFA', border: '1px solid #7C2D12', minHeight: '40px', maxHeight: '200px' }}
                />
                <div className="flex items-center gap-1 mt-1">
                  <Button size="sm" className="h-6 text-xs px-2" style={{ backgroundColor: '#C2410C', color: '#fff' }} onClick={handleSaveEdit}>
                    <Check className="h-3 w-3 mr-1" /> Salvar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" style={{ color: '#71717A' }} onClick={handleCancelEdit}>
                    <X className="h-3 w-3 mr-1" /> Cancelar
                  </Button>
                  <span className="text-[10px] ml-2" style={{ color: '#52525B' }}>Esc para cancelar, Enter para salvar</span>
                </div>
              </div>
            ) : (
              <div className="text-sm mt-0.5 prose prose-invert prose-sm max-w-none break-words
                prose-p:my-0 prose-p:leading-relaxed
                prose-strong:font-semibold prose-strong:text-zinc-200
                prose-em:text-zinc-300
                prose-code:text-orange-400 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
                style={{ color: '#D4D4D8' }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* Attachments */}
            {!isEditing && message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => {
                  const isImage = att.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) || att.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                  if (isImage) {
                    return (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={att.url} alt={att.name || 'Anexo'} className="max-w-[240px] max-h-[180px] rounded-lg object-cover border" style={{ borderColor: '#27272A' }} />
                      </a>
                    );
                  }
                  return (
                    <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:opacity-80 transition-opacity" style={{ backgroundColor: '#27272A', color: '#A1A1AA', border: '1px solid #3F3F46' }}>
                      📎 {att.name || 'Arquivo'}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Linked evidence badge */}
            {linkedEvidence && (
              <div className="mt-2">
                <Badge className="text-[10px] h-5 gap-1 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }} onClick={() => navigate('/app/marketing/execucao')}>
                  <CheckCircle2 className="h-2.5 w-2.5" /> Comprovação vinculada <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                </Badge>
              </div>
            )}

            {/* Comprovação inline action */}
            {showComprovacao && !linkedEvidence && !isEditing && (
              <button onClick={() => setLinkSheetOpen(true)} className="flex items-center gap-1 mt-2 text-[11px] font-medium transition-colors hover:opacity-80" style={{ color: '#F97316' }}>
                <ClipboardCheck className="h-3 w-3" /> Vincular Comprovação
              </button>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {message.reactions.map((reaction) => (
                  <button key={reaction.emoji} onClick={() => onReaction?.(message.id, reaction.emoji)} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors hover:bg-zinc-700" style={{ backgroundColor: reaction.hasReacted ? 'rgba(194, 65, 12, 0.2)' : '#27272A', border: reaction.hasReacted ? '1px solid rgba(194, 65, 12, 0.5)' : '1px solid transparent', color: reaction.hasReacted ? '#EA580C' : '#A1A1AA' }}>
                    <span>{reaction.emoji}</span>
                    <span className="font-medium">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Reply count */}
            {message.replyCount && message.replyCount > 0 && (
              <button onClick={() => onReply?.(message.id)} className="flex items-center gap-1 mt-2 text-xs font-medium transition-colors hover:underline" style={{ color: '#3B82F6' }}>
                <MessageSquare className="h-3 w-3" />
                <span>{message.replyCount} {message.replyCount === 1 ? 'resposta' : 'respostas'}</span>
              </button>
            )}
          </div>

          {/* Hover Actions */}
          {isHovered && !isEditing && (
            <div className="absolute top-0 right-2 flex items-center gap-0.5 -mt-3 px-1 py-0.5 rounded-lg shadow-lg" style={{ backgroundColor: '#27272A', border: '1px solid #3f3f46' }}>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-600" style={{ color: '#A1A1AA' }}>
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" style={{ backgroundColor: '#27272A', border: '1px solid #3f3f46' }}>
                  <div className="flex gap-1">
                    {quickReactions.map((emoji) => (
                      <button key={emoji} onClick={() => { onReaction?.(message.id, emoji); setShowEmojiPicker(false); }} className="p-1.5 rounded hover:bg-zinc-600 text-lg transition-transform hover:scale-110">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-600" style={{ color: '#A1A1AA' }} onClick={() => onReply?.(message.id)}>
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-600" style={{ color: isBookmarked ? '#EA580C' : '#A1A1AA' }} onClick={() => onBookmark?.(message.id)}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-zinc-600" style={{ color: '#A1A1AA' }}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ backgroundColor: '#27272A', borderColor: '#3f3f46' }}>
                  {isOwn && (
                    <>
                      <DropdownMenuItem onClick={handleStartEdit} style={{ color: '#A1A1AA' }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Editar mensagem
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} style={{ color: '#EF4444' }}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir mensagem
                      </DropdownMenuItem>
                      <DropdownMenuSeparator style={{ backgroundColor: '#3F3F46' }} />
                    </>
                  )}
                  <DropdownMenuItem style={{ color: '#A1A1AA' }}>Copiar link</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPin?.(message.id, !!message.isPinned)} style={{ color: '#A1A1AA' }}>
                    <Pin className="h-3.5 w-3.5 mr-2" />
                    {message.isPinned ? 'Desafixar mensagem' : 'Fixar mensagem'}
                  </DropdownMenuItem>
                  <DropdownMenuItem style={{ color: '#A1A1AA' }}>Copiar texto</DropdownMenuItem>
                  {showComprovacao && !linkedEvidence && (
                    <>
                      <DropdownMenuSeparator style={{ backgroundColor: '#3F3F46' }} />
                      <DropdownMenuItem onClick={() => setLinkSheetOpen(true)} style={{ color: '#F97316' }}>
                        <ClipboardCheck className="h-3.5 w-3.5 mr-2" /> Vincular Comprovação
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </article>

      <LinkComprovacaoSheet open={linkSheetOpen} onOpenChange={setLinkSheetOpen} message={message} onLinked={handleLinked} />

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#FAFAFA' }}>Excluir mensagem</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#A1A1AA' }}>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ backgroundColor: '#27272A', color: '#A1A1AA', borderColor: '#3F3F46' }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }} onClick={() => onDelete?.(message.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
