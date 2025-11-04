import { useState, useEffect } from "react";
import { Sprout, Users, Target, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const Results = () => {
  const [responses, setResponses] = useState(0);
  const treesPlanted = Math.floor(responses / 100);
  const progressToNext = responses % 100;
  const remainingToNext = 100 - progressToNext;

  // Buscar contagem real de pesquisas completas e atualizar em tempo real
  useEffect(() => {
    const fetchResponseCount = async () => {
      // Contar respondentes únicos ao invés de respostas individuais
      const { data, error } = await supabase
        .from("fct_response")
        .select("respondent_id");
      
      if (data && !error) {
        const uniqueRespondents = new Set(data.map(r => r.respondent_id)).size;
        setResponses(uniqueRespondents);
      }
    };

    fetchResponseCount();

    // Escutar novas respostas em tempo real
    const channel = supabase
      .channel("response-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fct_response",
        },
        () => {
          fetchResponseCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isGoalReached = progressToNext === 0 && responses > 0;

  // Dados simulados da árvore
  const treeData = {
    species: "Ipê Amarelo (Handroanthus albus)",
    location: "Parque da Cidade Sarah Kubitschek, Brasília - DF",
    coordinates: "15°47'38.9\"S 47°53'27.6\"W",
    plantedDate: "15 de Janeiro de 2025",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Sprout className="h-10 w-10 text-primary animate-pulse-soft" />
            Arena Mais Verde
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
                  <span>Pesquisas completas até agora</span>
                </div>
                <div className="text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-pulse-soft">
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
                    {remainingToNext} pesquisas
                  </span>{" "}
                  para a próxima árvore! 🌳
                </p>
              </div>
            </>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/10 border-primary">
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
            <Card className="p-4 bg-accent/10 border-accent">
              <div className="text-center space-y-1">
                <div className="text-3xl font-bold text-accent">
                  {treesPlanted * 22}kg
                </div>
                <div className="text-sm text-muted-foreground">
                  CO₂ Compensado
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full text-lg h-14 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all duration-300 shadow-md"
              >
                <Sprout className="mr-2 h-5 w-5" />
                Veja sua Árvore!
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sprout className="h-6 w-6 text-primary" />
                  Sua Árvore Plantada
                </DialogTitle>
                <DialogDescription>
                  Conheça a espécie e localização da árvore plantada através do
                  programa Arena Mais Verde
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={treeData.image}
                  alt="Momento do plantio"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sprout className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Espécie
                      </h3>
                      <p className="text-muted-foreground">{treeData.species}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Localização
                      </h3>
                      <p className="text-muted-foreground">
                        {treeData.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {treeData.coordinates}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Data do Plantio
                      </h3>
                      <p className="text-muted-foreground">
                        {treeData.plantedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Motivational Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border-primary animate-slide-up">
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
          <p>Programa Arena Mais Verde • Arena BRB</p>
        </div>
      </div>
    </div>
  );
};

export default Results;
