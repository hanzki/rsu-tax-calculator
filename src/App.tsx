import React from 'react';
import { Container } from '@mui/system';
import { ThemeProvider, createTheme, Typography, Divider, CircularProgress, Box, Link } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { calculateTaxes, TaxSaleOfSecurity } from './calculator';
import { ECBConverter } from './ecbRates';
import { CalculationSettings, InputPanel } from './InputPanel/InputPanel';
import { ResultsPanel } from './ResultsPanel/ResultsPanel';
import { InstructionsPanel } from './InstructionsPanel/InstructionsPanel';
import { Footer } from './Footer';

const theme = createTheme();

// Arbitary delay to make the calculations feel more significant
const CALCULATION_DELAY = 1500;

const CHANGELOG_URL = 'https://github.com/hanzki/rsu-tax-calculator/blob/master/CHANGELOG.md';

function App() {
  const [ecbConverter, setECBConverter] = React.useState<ECBConverter>();
  const [taxReport, setTaxReport] = React.useState<TaxSaleOfSecurity[]>();
  const [calculating, setCalculating] = React.useState(false);
  const [error, setError] = React.useState<any>();

  React.useEffect(() => {
    ECBConverter.loadECBData().then(converter => {
      setECBConverter(converter);
    });
  }, []);

  const onCalculate = (settings: CalculationSettings) => {
    setCalculating(true);
    setError(undefined);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!ecbConverter) {
          throw new Error('Missing ECB currency rates');
        }
        try {
          setTaxReport(calculateTaxes(settings.individualHistory, settings.eacHistory, ecbConverter));
        } catch (error: any) {
          setError(error);
          setCalculating(false);
          reject(error);
        }

        setCalculating(false);
        resolve();
      }, CALCULATION_DELAY)
    }) 
  }

  const CalculationProgress = () => <Box sx={{
    textAlign: 'center',
    pt: 1
  }}>
    <CircularProgress size={80}/>
  </Box>

  const CalculationError = () => <Box sx={{
    textAlign: 'center',
    pt: 1
  }}>
    <ErrorOutlineIcon color='error' sx={{ fontSize: 80 }}/>
    <Typography color='error' fontWeight={'bold'}>Calculating failed!</Typography>
    <Typography color='error' fontSize={'small'}>{error?.message || error}</Typography>
  </Box>

  const VersionLink = () => <Link 
    href={CHANGELOG_URL}
    variant={'subtitle1'}
    color='text.secondary'
    underline='hover'
    sx={{whiteSpace: 'nowrap'}}
  >v{__APP_VERSION__}</Link>

  return (
    <ThemeProvider theme={theme}>
      <div className="App" style={{background: '#AED6F1'}}>
        <Container maxWidth="lg" sx={{bgcolor: 'background.default', minHeight: '100vh'}}>
          <Typography textAlign={'center'} variant={'h2'} gutterBottom>
            RSU Tax Calculator&nbsp;<VersionLink/>
          </Typography>

          <InstructionsPanel/>

          <Divider variant='middle' sx={{m: 1}}/>
          
          <InputPanel onCalculate={onCalculate}/>

          <Divider variant='middle' sx={{m: 1}}/>

          { calculating && <CalculationProgress/> }

          { error && <CalculationError/> }

          { taxReport && <ResultsPanel taxReport={taxReport}/> }

          { (calculating || taxReport) && <Divider variant='middle' sx={{m: 1}}/>}

          <Footer/>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
