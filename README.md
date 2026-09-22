# Total Alocație
Aplicație React + TypeScript pentru explicarea și estimarea transparentă a alocației de stat pentru copii. Versiunea actuală este un MVP anonim, fără salvare cloud și fără reguli juridice activate până la verificarea surselor oficiale.

## Cerințe

- Node.js LTS compatibil cu versiunile din `package.json`
- npm

## Comenzi

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run validate:legal
npm run build
npm run build:server
```

`npm run dev` pornește clientul Vite și API-ul Express. Clientul este disponibil la `http://localhost:5173`, iar verificarea backend la `http://localhost:3001/api/health`.

## Stare de acoperire

Datasetul `2026-09-unverified` are zero reguli de producție activate. Calculatorul marchează lunile ca nerezolvate și nu inventează sume. Vezi [docs/legal-coverage.md](docs/legal-coverage.md) pentru sursele care trebuie cercetate și limitele curente.

## Confidențialitate

Calculul este anonim și rămâne în memorie. Nu există încă integrare Clerk sau endpointuri de salvare a scenariilor. Nu introduce CNP, adrese, documente, diagnostice sau date bancare. Cloud saving va fi implementat separat, cu consimțământ explicit, limită de metadate și aprobare de confidențialitate.

## Limitări cunoscute

- Nu sunt activate cuantumuri istorice.
- Nu există încă ledger pentru sume declarate, grafice, export PNG sau autentificare Clerk.
- Testarea automată acoperă fundația de calendar, contractul calculatorului și shell-ul UI; accesibilitatea AAA nu poate fi declarată fără audit. Implementarea urmărește practici WCAG și va necesita verificare manuală și automatizată înainte de producție.
