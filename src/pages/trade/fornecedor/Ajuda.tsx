import { HelpCircle, Mail, Phone, FileText, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FornecedorAjuda() {
  const faqs = [
    {
      question: 'Como enviar uma comprovação?',
      answer: 'Acesse a seção "Comprovações" no menu lateral, selecione o item do checklist correspondente, faça upload da foto e clique em "Enviar". Lembre-se de incluir a data visível na foto.'
    },
    {
      question: 'Por que minha comprovação foi rejeitada?',
      answer: 'As comprovações podem ser rejeitadas por diversos motivos: foto sem data visível, imagem desfocada, material não visível completamente, ou contexto inadequado. Verifique o motivo específico e reenvie uma nova foto.'
    },
    {
      question: 'Qual o prazo para enviar as comprovações?',
      answer: 'Cada item do checklist possui uma data de vencimento específica. Você pode ver essa data na lista de itens pendentes. Recomendamos enviar com pelo menos 2 dias de antecedência.'
    },
    {
      question: 'Como saber se minha comprovação foi aprovada?',
      answer: 'Acompanhe o status na seção "Histórico" dentro de Comprovações. O status mudará para "Aprovado" após a revisão da equipe de trade marketing.'
    },
    {
      question: 'Posso reenviar uma comprovação rejeitada?',
      answer: 'Sim! Itens rejeitados voltam a aparecer no checklist de pendentes. Basta enviar uma nova foto corrigindo o problema apontado no motivo da rejeição.'
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Ajuda" 
        description="Central de suporte e dúvidas frequentes"
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* FAQs */}
        <Card className="card-base lg:col-span-2">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Accordion type="single" collapsible className="space-y-1">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded bg-muted/30 px-3">
                  <AccordionTrigger className="text-xs font-medium py-2 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="space-y-4">
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Contato</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <a 
                href="mailto:trade@araripe.me" 
                className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Mail className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">E-mail</p>
                  <p className="text-[10px] text-muted-foreground truncate">trade@araripe.me</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
              <a 
                href="tel:+551140028922" 
                className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Phone className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Telefone</p>
                  <p className="text-[10px] text-muted-foreground">(11) 4002-8922</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
            </CardContent>
          </Card>

          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Documentação</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <a 
                href="#" 
                className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Manual do Fornecedor</p>
                  <p className="text-[10px] text-muted-foreground">PDF · 2.3 MB</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
