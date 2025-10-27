import { useState, useEffect } from "react";
import { Sprout, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TreeCounterProps {
  initialResponses?: number;
}

const TreeCounter = ({ initialResponses = 0 }: TreeCounterProps) => {
  const [responses, setResponses] = useState(initialResponses);
  const treesPlanted = Math.floor(responses / 100);
  const progressToNext = responses % 100;
  const remainingToNext = 100 - progressToNext;

  // Simulação de respostas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setResponses((prev) => {
        const newValue = prev + Math.floor(Math.random() * 3);
        return newValue > 300 ? 0 : newValue;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isGoalReached = progressToNext === 0 && responses > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Sprout className="h-10 w-10 text-primary animate-pulse-soft" />
            Rumo à Próxima Árvore!
          </h1>
          <p className="text-lg text-muted-foreground">
            Cada resposta é uma semente para o futuro 🌱
          </p>
        </div>

        {/* Main Counter Card */}
        <Card className="p-8 space-y-6 shadow-lg animate-grow">
          {isGoalReached ? (
            <div className="text-center space-y-4 animate-grow">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-primary">
                Parabéns! Uma nova árvore será plantada!
              </h2>
              <p className="text-muted-foreground">
                Vocês fizeram a diferença para o planeta!
              </p>
            </div>
          ) : (
            <>
              {/* Contador Principal */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  <span>Respostas até agora</span>
                </div>
                <div className="text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse-soft">
                  {responses}
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Progresso
                  </span>
                  <span className="font-semibold text-primary">
                    {progressToNext}/100
                  </span>
                </div>
                <Progress value={progressToNext} className="h-4" />
                <p className="text-center text-sm text-muted-foreground">
                  Faltam apenas{" "}
                  <span className="font-bold text-primary">
                    {remainingToNext} respostas
                  </span>{" "}
                  para a próxima árvore! 🌳
                </p>
              </div>
            </>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-accent/20 border-accent">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-primary">
                  {treesPlanted}
                </div>
                <div className="text-sm text-muted-foreground">
                  Árvore{treesPlanted !== 1 ? "s" : ""} Plantada
                  {treesPlanted !== 1 ? "s" : ""}
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-secondary/20 border-secondary">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-secondary">
                  {Math.ceil(remainingToNext / 10)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Minutos estimados
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full text-lg h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-md"
            onClick={() => alert("Redirecionando para a pesquisa... 📋")}
          >
            <Sprout className="mr-2 h-5 w-5" />
            Responder Pesquisa Agora
          </Button>
        </Card>

        {/* Motivational Card */}
        <Card className="p-6 bg-gradient-to-r from-accent/30 to-secondary/20 border-accent animate-slide-up">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              💚 Cada clique conta para o planeta!
            </p>
            <p className="text-sm text-muted-foreground">
              Juntos, já compensamos {treesPlanted * 22}kg de CO₂ e criamos
              habitats para a fauna local.
            </p>
          </div>
        </Card>

        {/* Info Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>🌍 Dados atualizados em tempo real via QR Code</p>
          <p>Tecnologia: React + Firebase Realtime Database</p>
        </div>
      </div>
    </div>
  );
};

export default TreeCounter;
