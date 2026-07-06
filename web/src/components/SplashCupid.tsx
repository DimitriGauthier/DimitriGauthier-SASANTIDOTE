"use client";

// Cupidon 2.5D du splash « INTIMY ».
// Le vrai chérubin illustré (/img/cupid.png) est décomposé en deux plans :
//   • cupid-wings.png : l'aile, placée EN ARRIÈRE (translateZ négatif) → elle bat et
//     parallaxe indépendamment du corps ;
//   • cupid.png        : le corps complet, au premier plan.
// L'ensemble est monté dans une scène en perspective : il entre en vol, puis BASCULE
// en 3/4 vers la caméra (rotateY) au moment où il décoche — effet « 2.5D » sans redessin.
//
// 100 % auto-contenu : deux <img> + keyframes CSS scopées. Aucune dépendance.
// Le fondu de sortie est géré par le conteneur parent (.splash-actors) du splash.

export default function SplashCupid() {
  return (
    <div className="sc-stage" aria-hidden>
      <style dangerouslySetInnerHTML={{ __html: SC_CSS }} />
      <div className="sc-fly">
        <div className="sc-bob">
          <div className="sc-bank">
            <div className="sc-flip">
              {/* Aile en arrière-plan : bat et donne la profondeur */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/cupid-wings.png" alt="" className="sc-wings" />
              {/* Corps complet au premier plan */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/cupid.png" alt="Cupidon" className="sc-body" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SC_CSS = `
.sc-stage{position:relative;width:100%;aspect-ratio:208/200;perspective:1000px}
.sc-stage *{box-sizing:border-box}

/* Entrée en vol (translateX + opacité) — se fige à 0 */
.sc-fly{position:absolute;inset:0;transform-style:preserve-3d;
  animation:sc-in .7s cubic-bezier(.2,.7,.3,1) both;will-change:transform,opacity}
/* Flottement continu */
.sc-bob{position:absolute;inset:0;transform-style:preserve-3d;
  animation:sc-bob 3.4s ease-in-out .7s infinite}
/* Bascule 3/4 vers la caméra */
.sc-bank{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:52% 55%;
  animation:sc-bank 3.5s cubic-bezier(.35,.1,.25,1) both;will-change:transform}
/* Le chérubin vise à gauche dans l'illustration : on le retourne pour décocher vers le centre */
.sc-flip{position:absolute;inset:0;transform-style:preserve-3d;transform:scaleX(-1)}

.sc-body,.sc-wings{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
  -webkit-user-select:none;user-select:none;pointer-events:none}
.sc-body{transform:translateZ(0);filter:drop-shadow(0 14px 30px hsl(var(--deep) / 0.34))}
/* Aile en retrait + battement (pivot à la base de l'aile) */
.sc-wings{transform-origin:61% 44%;
  animation:sc-flap 1s ease-in-out .7s infinite;will-change:transform;
  filter:drop-shadow(0 4px 10px hsl(var(--deep) / 0.10))}

@keyframes sc-in{
  0%{opacity:0;transform:translateX(-72px) scale(.94)}
  100%{opacity:1;transform:translateX(0) scale(1)}
}
@keyframes sc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes sc-bank{
  0%  {transform:rotateY(-24deg) rotateZ(3deg)}
  18% {transform:rotateY(-19deg) rotateZ(1.5deg)}
  43% {transform:rotateY(27deg)  rotateZ(-5deg)}   /* décochage : 3/4 face caméra */
  50% {transform:rotateY(19deg)  rotateZ(-2.5deg)} /* recul après tir */
  100%{transform:rotateY(15deg)  rotateZ(-1.5deg)} /* stabilisation */
}
@keyframes sc-flap{
  0%,100%{transform:translateZ(-18px) rotate(0deg)}
  50%    {transform:translateZ(-18px) rotate(10deg)}
}

@media (prefers-reduced-motion: reduce){
  .sc-fly,.sc-bob,.sc-bank,.sc-wings{animation:none}
  .sc-bank{transform:rotateY(10deg)}
}
`;
