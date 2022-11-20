import React from 'react';
import { Container } from '@mui/system';
import { ThemeProvider, createTheme, Typography, Divider, CircularProgress } from '@mui/material';
import { calculateTaxes, TaxSaleOfSecurity } from './calculator';
import { ECBConverter } from './ecbRates';
import { CalculationSettings, InputPanel } from './InputPanel/InputPanel';
import { ResultsPanel } from './ResultsPanel/ResultsPanel';
import { InstructionsPanel } from './InstructionsPanel/InstructionsPanel';

const theme = createTheme();

// Arbitary delay to make the calculations feel more significant
const CALCULATION_DELAY = 1500;

function App() {
  const [ecbConverter, setECBConverter] = React.useState<ECBConverter>();
  const [taxReport, setTaxReport] = React.useState<TaxSaleOfSecurity[]>();
  const [calculating, setCalculating] = React.useState(false);

  React.useEffect(() => {
    ECBConverter.loadECBData().then(converter => {
      setECBConverter(converter);
    });
  }, []);

  const onCalculate = (settings: CalculationSettings) => {
    setCalculating(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!ecbConverter) {
          throw new Error('Missing ECB currency rates');
        }
        setTaxReport(calculateTaxes(settings.individualHistory, settings.eacHistory, ecbConverter));

        setCalculating(false);
        resolve();
      }, CALCULATION_DELAY)
    }) 
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App" style={{background: '#AED6F1'}}>
        <Container maxWidth="lg" sx={{bgcolor: 'background.default', minHeight: '100vh'}}>
          <Typography textAlign={'center'} variant={'h2'} gutterBottom>RSU Tax Calculator
            <Typography component='span' sx={{color: 'text.secondary', whiteSpace: 'nowrap'}}>v{process.env.REACT_APP_VERSION}</Typography>
          </Typography>

          <InstructionsPanel/>

          <Divider variant='middle' sx={{m: 1}}/>
          
          <InputPanel onCalculate={onCalculate}/>

          <Divider variant='middle' sx={{m: 1}}/>

          { calculating && <CircularProgress size={80}/> }

          { taxReport && <ResultsPanel taxReport={taxReport}/> }
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
