import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Sprout, ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Survey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFinal, setShowFinal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions: Array<{
    id: number;
    question: string;
    type?: string;
    subtitle?: string;
    options?: string[];
  }> = [
    {
      id: 0,
      question: "Como você se declara?",
      options: [
        "Mulher Cisgênero",
        "Mulher Trans",
        "Homem Cisgênero",
        "Homem Trans",
        "Prefiro não me informar",
      ],
    },
    {
      id: 1,
      question: "Qual é a sua faixa etária?",
      options: [
        "Abaixo de 18 anos",
        "18 a 25 anos",
        "26 a 35 anos",
        "36 a 45 anos",
        "Acima de 45 anos",
      ],
    },
    {
      id: 2,
      question: "Qual tipo de evento você participou na Arena BRB?",
      options: [
        "Shows/Festivais",
        "Evento Executivo",
        "Jogo de futebol",
        "Evento infantil",
        "Tour guiado",
      ],
    },
    {
      id: 3,
      question:
        "Qual foi o principal meio de transporte que você utilizou para chegar à Arena BRB?",
      options: [
        "Carro Particular",
        "Aplicativo (Uber/99)",
        "Transporte Público",
        "Carona/Táxi",
        "Outro",
      ],
    },
    {
      id: 4,
      question:
        "Em uma escala de 1 a 10, qual a chance de você recomendar a Arena BRB a um(a) amigo(a) ou colega?",
      type: "scale",
      options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      id: 5,
      question:
        "Encontrou o seu portão de entrada com a mesma facilidade que encontra a saída?",
      options: [
        "Extremamente Fácil",
        "Fácil",
        "Razoável",
        "Difícil",
        "Muito Difícil",
      ],
    },
    {
      id: 6,
      question:
        "Se você pudesse dar um troféu, qual área da Arena merece destaque pela experiência que entregou?",
      options: [
        "Qualidade do Show/Jogo (O Evento principal)",
        "Atendimento do Staff e Segurança",
        "Limpeza e Banheiros",
        "Áreas de Alimentação (Bar/Stands)",
        "Estrutura (Sinalização, Wi-Fi, Acesso)",
        "Acessibilidade",
      ],
    },
    {
      id: 7,
      question:
        "Para melhorar, qual dos itens abaixo gerou mais frustração ou atraso na sua experiência?",
      options: [
        "Estacionamento / Chegada",
        "Filas na Entrada",
        "Preços da Alimentação",
        "Tempo de Espera nos Banheiros",
        "Nada me frustrou",
      ],
    },
    {
      id: 8,
      question: "Qual a sua vibe para o próximo evento no Arena BRB?",
      options: [
        "Amei!",
        "Já adquiri meu próximo ingresso",
        "Não voltarei"
      ],
    },
    {
      id: 9,
      question: "Qual próximo artista você gostaria de ver no Arena BRB?",
      type: "text",
    },
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save survey responses to database
      setIsSubmitting(true);
      
      try {
        // Create respondent profile
        const { data: respondentData, error: respondentError } = await supabase
          .from("dim_respondent")
          .insert({
            gender: answers[0],
            age_band: answers[1],
            transport_mode: answers[3],
          })
          .select()
          .single();

        if (respondentError) throw respondentError;

        // Get or create a valid event
        let eventId;
        
        // Try to get existing event matching the type
        const { data: events } = await supabase
          .from("dim_event")
          .select("event_id")
          .eq("event_type", answers[2])
          .limit(1);

        if (events && events.length > 0) {
          eventId = events[0].event_id;
        } else {
          // Try to get any existing event
          const { data: anyEvent } = await supabase
            .from("dim_event")
            .select("event_id")
            .limit(1)
            .maybeSingle();
          
          if (anyEvent) {
            eventId = anyEvent.event_id;
          }
        }

        // If still no event, create a default one
        if (!eventId) {
          const eventTypeMap: Record<string, string> = {
            "Shows/Festivais": "shows/festivais",
            "Evento Executivo": "executivo",
            "Jogo de futebol": "futebol",
            "Evento infantil": "infantil",
            "Tour guiado": "tour"
          };
          
          const { data: newEvent, error: createError } = await supabase
            .from("dim_event")
            .insert({
              event_code: `EVT${Date.now()}`,
              name: `${answers[2]} - Arena BRB`,
              event_date: new Date().toISOString().split('T')[0],
              event_type: eventTypeMap[answers[2]] || "tour",
              capacity: 1000,
            })
            .select("event_id")
            .single();

          if (createError) {
            console.error("Erro ao criar evento:", createError);
            throw new Error("Não foi possível criar evento para a pesquisa");
          }
          
          eventId = newEvent.event_id;
        }

        // Prepare responses for insertion
        const responses = [
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "nps",
            answer_numeric: parseFloat(answers[4]),
            answer_value: answers[4],
          },
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "wayfinding_ease",
            answer_value: answers[5],
          },
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "trophy",
            answer_value: answers[6],
          },
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "frustration",
            answer_value: answers[7],
          },
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "vibe",
            answer_value: answers[8],
          },
          {
            event_id: eventId,
            respondent_id: respondentData.respondent_id,
            question_id: "next_artist",
            answer_value: answers[9],
          },
        ];

        const { error: responsesError } = await supabase
          .from("fct_response")
          .insert(responses);

        if (responsesError) throw responsesError;

        toast({
          title: "Pesquisa enviada com sucesso!",
          description: "Sua contribuição ajudará a plantar mais árvores.",
        });

        setShowFinal(true);
      } catch (error) {
        console.error("Erro ao salvar pesquisa:", error);
        toast({
          title: "Erro ao enviar pesquisa",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = answers[currentQuestion] !== undefined;

  if (showFinal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8 space-y-6 text-center animate-grow">
          <div className="flex justify-center">
            <CheckCircle2 className="h-20 w-20 text-primary animate-pulse-soft" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Obrigado por participar! 🌱
          </h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Em nome de toda a comunidade da Arena BRB, informamos que sua
            resposta foi contabilizada. Através do programa{" "}
            <span className="font-bold text-primary">ARENA MAIS VERDE</span>, a
            cada 100 pesquisas completas respondidas, a Arena BRB garante o
            plantio de uma nova muda em Brasília, transformando seu feedback em
            um impacto real e sustentável.
          </p>
          <p className="text-lg font-semibold text-accent">
            Continue fazendo parte da nossa história!
          </p>
          <Button
            size="lg"
            className="w-full text-lg h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => navigate("/results")}
          >
            <Sprout className="mr-2 h-5 w-5" />
            Ver Árvores Plantadas!
          </Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <Sprout className="h-8 w-8 text-primary animate-pulse-soft" />
            Arena Mais Verde
          </h1>
          <p className="text-muted-foreground">
            Cada resposta planta uma semente 🌱
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="p-8 space-y-6 animate-grow">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {currentQ.question}
            </h2>
            {currentQ.subtitle && (
              <p className="text-sm text-muted-foreground">
                {currentQ.subtitle}
              </p>
            )}
          </div>

          {currentQ.type === "text" ? (
            <Textarea
              placeholder="Digite sua resposta aqui..."
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              className="min-h-[120px] text-base"
            />
          ) : currentQ.type === "scale" ? (
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-2">
              {currentQ.options.map((option) => (
                <Button
                  key={option}
                  variant={
                    answers[currentQuestion] === option ? "default" : "outline"
                  }
                  className={`h-14 text-lg font-bold ${
                    answers[currentQuestion] === option
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/10 transition-colors cursor-pointer"
                  onClick={() => handleAnswer(option)}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label
                    htmlFor={option}
                    className="text-base cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <Button
            size="lg"
            className="w-full text-lg h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? (
              "Enviando..."
            ) : currentQuestion < questions.length - 1 ? (
              <>
                Próxima Pergunta
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Finalizar Pesquisa
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
