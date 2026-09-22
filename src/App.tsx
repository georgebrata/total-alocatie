import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { calculateEstimate, DATASET_VERSION } from './domain/calculate'
import { isValidDate, isValidMonth, lastCompletedMonth } from './domain/calendar'
import { estimatedRules } from './legal-data'
import type { DisabilityAnswer } from './domain/types'

interface AppProps { darkMode: boolean; onToggleTheme: () => void }

const today = new Date()
const defaultCutoff = lastCompletedMonth(today)
const MIN_BIRTHDATE = '1991-01-01'

function formatRons(minorUnits: bigint): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(Number(minorUnits) / 100)
}

function formatBirthdate(value: string): string {
  if (!isValidDate(value)) return 'data introdusă'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

function readUrlParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? ''
}

function hasCompleteUrlForm(): boolean {
  const params = new URLSearchParams(window.location.search)
  const birthdate = params.get('birthdate') ?? ''
  const asOfMonth = params.get('asOfMonth') ?? ''
  const disability = params.get('disability')
  return isValidDate(birthdate) && birthdate >= MIN_BIRTHDATE && isValidMonth(asOfMonth) && (disability === 'yes' || disability === 'no' || disability === 'unknown') && params.get('confirmed') === 'true'
}

function App({ darkMode, onToggleTheme }: AppProps) {
  const [birthdate, setBirthdate] = useState(() => readUrlParam('birthdate'))
  const [asOfMonth, setAsOfMonth] = useState(() => readUrlParam('asOfMonth') || defaultCutoff)
  const [disability, setDisability] = useState<DisabilityAnswer>(() => {
    const value = readUrlParam('disability')
    return value === 'yes' || value === 'no' ? value : 'unknown'
  })
  const [confirmed, setConfirmed] = useState(() => readUrlParam('confirmed') === 'true')
  const [submitted, setSubmitted] = useState(hasCompleteUrlForm)

  useEffect(() => {
    const params = new URLSearchParams()
    if (birthdate) params.set('birthdate', birthdate)
    if (asOfMonth) params.set('asOfMonth', asOfMonth)
    params.set('disability', disability)
    params.set('confirmed', String(confirmed))
    const query = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  }, [asOfMonth, birthdate, confirmed, disability])

  const result = useMemo(() => submitted ? calculateEstimate({
    schemaVersion: 1,
    datasetVersion: DATASET_VERSION,
    mode: 'estimate',
    birthdate,
    asOfMonth,
    disability,
    domesticAssumptionsConfirmed: confirmed,
  }, estimatedRules) : null, [asOfMonth, birthdate, confirmed, disability, submitted])

  const yearlyTotals = useMemo(() => {
    if (!result) return []
    const totals = new Map<string, bigint>()
    result.monthlyItems.forEach((item) => {
      if (item.amountInMinorUnits === null) return
      const year = item.month.slice(0, 4)
      totals.set(year, (totals.get(year) ?? 0n) + item.amountInMinorUnits)
    })
    return Array.from(totals.entries()).sort(([left], [right]) => left.localeCompare(right))
  }, [result])

  const hasValidBirthdate = /^\d{4}-\d{2}-\d{2}$/.test(birthdate)
  const canCalculate = hasValidBirthdate && birthdate >= MIN_BIRTHDATE && /^\d{4}-(0[1-9]|1[0-2])$/.test(asOfMonth) && confirmed

  return (
    <Box className={`app-shell${darkMode ? ' dark-theme' : ''}`}>
      <Container maxWidth="lg">
        <Box component="header" className="topbar">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box className="brand-mark" aria-hidden="true">TA</Box>
            <Box>
                <Typography variant="h3" className="brand-name">Total Alocație</Typography>
                {/* <Typography variant="body2" color="text.secondary">un calcul clar, nu o promisiune</Typography> */}
            </Box>
          </Stack>
          <Tooltip title={darkMode ? 'Folosește tema deschisă' : 'Folosește tema întunecată'}>
            <IconButton onClick={onToggleTheme} aria-label={darkMode ? 'Activează tema deschisă' : 'Activează tema întunecată'}>{darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}</IconButton>
          </Tooltip>
        </Box>

        <Box component="main">
          <Box className="intro-grid">
            <Box>
              <Chip label="fără înregistrare" color="secondary" variant="outlined" className="ml-2 eyebrow" />
              <Typography variant="h1">Total Alocație</Typography>
              <Typography className="lead">Te ajutăm să înțelegi cât ai primit alocație în total.</Typography>
              {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                <Chip label="fără CNP" />
                <Chip label="fără date salvate implicit" />
                <Chip label="surse la vedere" />
              </Stack> */}
            </Box>
            {result && <Card className="note-card result-preview" aria-live="polite"><CardContent>
              <Typography variant="overline" color="secondary">Rezultatul tău</Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>Suma estimată pentru copilul născut la {formatBirthdate(birthdate)}</Typography>
              <Box className="result-chip-wrap result-chip-wrap-preview"><Chip className="result-chip" color="secondary" label={result.includedMonthCount > 0 ? formatRons(result.knownSubtotalMinorUnits) : 'Nu avem încă o sumă verificată'} /></Box>
              {/* <Typography color="text.secondary">{result.unresolvedMonthCount} luni nu au încă reguli verificate.</Typography> */}
            </CardContent></Card>}
          </Box>

          <Grid container alignItems="flex-start">
            <Grid size={{ xs: 12 }}>
              <Card component="section" aria-labelledby="calculator-title" className="calculator-card">
                <CardContent className="form-card-content">
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Box><Typography variant="overline" color="secondary">01 / despre copil</Typography><Typography id="calculator-title" variant="h3">Răspunde la câteva întrebări</Typography>
                    {/* <Typography color="text.secondary" sx={{ mt: 1 }}>Răspunde la câteva întrebări. Îți cerem mai multe detalii doar când sunt importante.</Typography> */}
                    </Box>
                    <Tooltip title="Rezultatul este doar o estimare. Nu dovedește că banii au fost plătiți."><InfoOutlinedIcon color="action" /></Tooltip>
                  </Stack>
                  <Stack component="form" spacing={3} sx={{ mt: 4 }} onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
                    <TextField label="Când s-a născut copilul?" type="date" value={birthdate} onChange={(event) => setBirthdate(event.target.value)} inputProps={{ min: MIN_BIRTHDATE }} InputLabelProps={{ shrink: true }} helperText="Alege o dată începând cu 1 ianuarie 1991. Nu avem nevoie de nume sau CNP." required />
                    <TextField label="Până în ce lună vrei să calculăm?" type="month" value={asOfMonth} onChange={(event) => setAsOfMonth(event.target.value)} InputLabelProps={{ shrink: true }} helperText={`Am ales automagic ultima lună încheiată: ${defaultCutoff}.`} required />
                    <FormControl>
                      <FormLabel id="disability-label">Copilul a avut un certificat de handicap?</FormLabel>
                      <RadioGroup aria-labelledby="disability-label" value={disability} onChange={(event) => setDisability(event.target.value as DisabilityAnswer)}>
                        <FormControlLabel value="no" control={<Radio />} label="Nu" />
                        <FormControlLabel value="yes" control={<Radio />} label="Da" />
                        <FormControlLabel value="unknown" control={<Radio />} label="Nu știu" />
                      </RadioGroup>
                      <Typography variant="body2" color="text.secondary">Întrebăm pentru că, în unele cazuri, alocația poate fi diferită. Nu cerem diagnostice sau acte.</Typography>
                    </FormControl>
                    <Alert severity="info">Calculul presupune că copilul locuia în România. Dacă a locuit sau a lucrat cineva din familie în altă țară, rezultatul poate fi diferit.</Alert>
                    <FormControlLabel control={<Radio checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />} label="Da, copilul locuia în România" />
                    <Button type="submit" variant="contained" color="primary" disabled={!canCalculate} endIcon={<ArrowForwardIcon />}>Calculează</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {result && <Card component="section" aria-live="polite" className="result-card calculator-card" sx={{ mt: 3 }}><CardContent>
            <Typography variant="overline" color="secondary">Rezultatul calculului</Typography>
            <Typography variant="h2" sx={{ mt: 1 }}>Suma estimată pentru copilul născut la {formatBirthdate(birthdate)}</Typography>
            <Box className="result-chip-wrap result-chip-wrap-detail"><Chip className="result-chip" color="secondary" label={result.includedMonthCount > 0 ? formatRons(result.knownSubtotalMinorUnits) : 'Nu avem încă o sumă verificată'} /></Box>
            {/* <Typography color="text.secondary">Pentru {result.unresolvedMonthCount} luni nu avem încă o regulă, iar valorile afișate sunt estimative. Asta nu înseamnă zero lei.</Typography> */}
            <Alert severity="warning" sx={{ mt: 2 }}>Acesta este un calcul orientativ bazat pe valori istorice neverificate. Nu arată banii primiți și nu este o decizie oficială.</Alert>
          </CardContent></Card>}

          {/* {result && <Accordion className="calculator-card" sx={{ mt: 2, margin: '0 auto' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { justifyContent: 'center' } }}>
              <Typography fontWeight={700} align="center">Scadențar</Typography>
            </AccordionSummary>
            <AccordionDetails className="schedule-details">
              <Stack spacing={1.25} className="schedule-list">
                {yearlyTotals.map(([year, total]) => <Stack key={year} direction="row" gap={2} className="schedule-row">
                  <Typography className="schedule-year">{year}</Typography>
                  <Typography fontWeight={700} className="schedule-amount">{formatRons(total)}</Typography>
                </Stack>)}
                <Stack direction="row" gap={2} className="schedule-row schedule-total">
                  <Typography fontWeight={700} className="schedule-year">Total total</Typography>
                  <Typography fontWeight={700} color="secondary" className="schedule-amount">{formatRons(result.knownSubtotalMinorUnits)}</Typography>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>} */}

          <Box component="section" aria-labelledby="faq-title" className="faq-section">
            <Typography id="faq-title" variant="h3" align="center">Întrebări frecvente</Typography>
            <Stack spacing={2} className="faq-list">
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>De ce nu cerem cont?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Poți folosi calculatorul fără cont. Nu suntem interesați să colectăm datele tale personale.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Ce înseamnă rezultatul?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Este o estimare. Nu este dovada că ai primit banii și nu este o decizie oficială.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Pe ce legislație se bazează calculul?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Calculul pornește de la regimul alocației de stat din Legea nr. 61/1993 și de la modificările sale istorice. Pentru perioadele recente ținem cont de tranziția prevăzută de OUG nr. 126/2021 și de actele ulterioare indicate în dataset, inclusiv OUG nr. 156/2024 și Legea nr. 141/2025. Fiecare cuantum trebuie verificat în forma actului aplicabil lunii respective.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>De ce calculul se oprește la 18 ani?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">În scenariul standard, alocația de stat se acordă până la împlinirea vârstei de 18 ani, conform cadrului instituit prin Legea nr. 61/1993 și modificările aplicabile. Calculatorul lucrează pe luni, așa că include luna în care copilul împlinește 18 ani și oprește lunile următoare. Situațiile speciale, cum ar fi anumite cazuri de handicap sau continuarea studiilor, necesită reguli juridice distincte și nu sunt confirmate automat aici.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Cum sunt tratate cuantumurile pentru handicap sau copiii mici?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Datasetul păstrează categorii distincte, inclusiv categoria „sub 2 ani sau handicap”. Pentru aceste cazuri sunt relevante Legea nr. 448/2006 și actele care modifică alocația de stat. Întrebarea din formular este doar un indiciu pentru categoria posibil aplicabilă; nu colectăm diagnostice și nu pretindem că am verificat eligibilitatea individuală.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>De ce apar valori în ROL și RON?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Pentru anii anteriori denominării, valorile sunt păstrate în moneda originală. Conversia urmează raportul legal 10.000 ROL = 1 RON, asociat Legii nr. 348/2004. Dacă o valoare nu poate fi reprezentată exact în bani RON, luna rămâne nerezolvată în loc să fie rotunjită.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Sunt aceste reguli deja verificate oficial?</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">Da, datasetul `2026-09-research-1` conține surse istorice de date și cercetare juridică, dar totalurile și regulile folosite pentru calcul sunt marcate ca estimative. Pentru activarea unui rezultat juridic complet ar trebui verificate forma actului, articolul, data intrării în vigoare și luna dreptului, inclusiv normele asociate HG nr. 577/2008.</Typography></AccordionDetails></Accordion>
            </Stack>
          </Box>

          <Box component="footer" className="site-footer">
            <Typography variant="body2" color="text.secondary">
              Creat cu <span className="footer-heart" aria-label="dragoste">♥</span> de <a href="https://georgebrata.ro/" target="_blank" rel="noreferrer">George</a>
            </Typography>
          </Box>
        </Box>
        </Container>
    </Box>
  )
}

export default App
