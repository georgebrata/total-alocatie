# Acoperire juridică

Ultima verificare: 22 septembrie 2026.

## Stare curentă

Datasetul `2026-09-research-1` conține înregistrări istorice importate din tabelul furnizat, inclusiv valori în ROL și RON. Toate aceste înregistrări sunt marcate `unverified`, deoarece tabelul folosește și surse secundare, iar intervalele istorice trebuie confruntate cu actele oficiale și versiunile lor aplicabile.

Aplicația are contractele și comportamentul pentru luni nerezolvate, dar nu activează automat niciun cuantum până când sursele istorice oficiale nu sunt verificate independent.

Prin urmare, interfața nu prezintă încă o estimare monetară pentru alocația de stat. Aceasta este o limitare deliberată, nu o valoare zero.

## Cercetare necesară

Pentru fiecare regulă trebuie documentate actul și versiunea istorică aplicabilă, articolul/paragraful, URL-ul oficial, data recuperării, data publicării, data intrării în vigoare, luna de referință a dreptului și distincția față de plata efectivă. Cercetarea trebuie să acopere cel puțin:

- Legea nr. 61/1993 și versiunile sale istorice;
- OUG nr. 126/2021, inclusiv tranziția din luna dreptului din ianuarie 2022;
- Legea nr. 348/2004 și conversia 10.000 ROL = 1 RON;
- normele asociate HG nr. 577/2008;
- Legea nr. 448/2006 pentru categoriile relevante de handicap;
- OUG nr. 156/2024, Legea nr. 141/2025 și modificările ulterioare;
- reguli istorice de educație, venit, ordinul copilului, aplicare întârziată și împlinirea pragurilor de vârstă.

Nu se vor completa golurile cu rate memorate sau extrapolate. Fiecare regulă activată va primi o versiune imuabilă de dataset, surse și teste cu valori așteptate calculate independent.

Valorile în lei vechi sunt păstrate în moneda originală și pot fi convertite exact doar când rezultatul poate fi reprezentat în bani RON. Valorile cu fracții de bani rămân nerezolvate până la definirea unei reprezentări raționale complete.

## Excluderi curente

Nu sunt automat calculate prestații diferite de alocația de stat. Nu sunt calculate dobânzi, penalități, arierate recuperabile sau ajustări la inflație. Cazurile transfrontaliere, statusul de handicap necunoscut și perioadele de educație nesusținute de reguli rămân nerezolvate.

O regulă citată nu este echivalentă cu o opinie juridică. Publicarea unui calcul complet va necesita revizuire juridică/independentă și o revizuire de confidențialitate pentru date despre copii și dizabilități.
