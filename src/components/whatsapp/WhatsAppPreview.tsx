import { useMemo } from 'react';
import { Wifi, Battery, Signal, MoreVertical, Phone, Video, Check, CheckCheck } from 'lucide-react';

interface WhatsAppPreviewProps {
  content: string;
  mediaType?: 'none' | 'image' | 'video';
  mediaUrl?: string;
  senderName?: string;
  variables?: Record<string, string>;
}

/**
 * WhatsApp Mobile Preview Component
 * Renders a realistic iPhone-style WhatsApp message preview
 */
export function WhatsAppPreview({ 
  content, 
  mediaType = 'none', 
  mediaUrl,
  senderName = 'Empresa',
  variables = {}
}: WhatsAppPreviewProps) {
  
  // Replace {{variable}} with actual values or placeholder
  const processedContent = useMemo(() => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || `[${varName}]`;
    });
  }, [content, variables]);

  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* iPhone Frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-3 shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="w-full h-full bg-[#0B141A] rounded-[32px] overflow-hidden flex flex-col">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white text-[10px]">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#1F2C34]">
            <div className="flex items-center gap-2 flex-1">
              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold">
                HS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{senderName}</p>
                <p className="text-[#8696A0] text-[10px]">online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#8696A0]">
              <Video className="h-5 w-5" />
              <Phone className="h-4 w-4" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>

          {/* Chat Background */}
          <div 
            className="flex-1 p-3 overflow-y-auto"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#0B141A'
            }}
          >
            {/* Date Badge */}
            <div className="flex justify-center mb-3">
              <span className="text-[10px] text-[#8696A0] bg-[#1F2C34] px-3 py-1 rounded-lg">
                Hoje
              </span>
            </div>

            {/* Message Bubble */}
            <div className="max-w-[85%] ml-auto">
              {/* Media Preview */}
              {mediaType !== 'none' && mediaUrl && (
                <div className="mb-1 rounded-lg overflow-hidden bg-[#1F2C34]">
                  {mediaType === 'image' ? (
                    <img 
                      src={mediaUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-[#1F2C34] flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Text Bubble */}
              <div className="bg-[#005C4B] rounded-lg rounded-tr-none p-2.5 relative">
                {/* Bubble Tail */}
                <div className="absolute -right-2 top-0 w-0 h-0 border-t-8 border-t-[#005C4B] border-r-8 border-r-transparent" />
                
                {/* Message Text */}
                <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                  {processedContent || 'Digite uma mensagem...'}
                </p>
                
                {/* Time and Status */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-[#8696A0]">{currentTime}</span>
                  <CheckCheck className="h-3.5 w-3.5 text-[#53BDEB]" />
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2 p-2 bg-[#1F2C34]">
            <div className="flex-1 flex items-center gap-2 bg-[#2A3942] rounded-full px-3 py-2">
              <span className="text-[#8696A0] text-sm">Mensagem</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#00A884] flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                <path d="M17.3 12c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Label */}
      <p className="text-[10px] text-muted-foreground mt-3">
        Prévia de como a mensagem aparecerá no WhatsApp
      </p>
    </div>
  );
}
