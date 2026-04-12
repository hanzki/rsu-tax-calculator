import { Box, Typography } from "@mui/material"
import React from "react"
import { EAC, Individual } from "../calculator/types";
import { Lot, filterHistoriesAfterYearEndReport } from "../calculator";
import { ParsedYearEndStatement } from "../parser/yearEndStatementParser";
import { EarlierInputMode, AdditionalInformation } from "./AdditionalInput";
import { FileUpload, FileUploadProps } from "../FileUpload/FileUpload";
import { parseEACHistory } from "../parser/schwabJSONEACHistoryParser";
import { parseIndividualHistory } from "../parser/schwabJSONIndividualHistoryParser";
import { CalculateButton } from "./CalculateButton";
import { ErrorAlert } from "./ErrorAlert";
import { WarningAlert } from "./WarningAlert";
export type CalculationSettings = {
    individualHistory: Individual.Transaction[],
    eacHistory: EAC.Transaction[]
    earlierLots?: { shares: number; acquisitionDate: Date; totalAcquisitionCost: number }[]
    earlierEacLots?: Lot[]
}

export type InputPanelProps = {
    onCalculate: (settings: CalculationSettings) => Promise<void>;
}

export const InputPanel: React.FC<InputPanelProps> = ({
    onCalculate
}) => {
    const [individualHistory, setIndividualHistory] = React.useState<Individual.Transaction[]>();
    const [eacHistory, setEACHistory] = React.useState<EAC.Transaction[]>();
    const [individualHistoryError, setIndividualHistoryError] = React.useState();
    const [eacHistoryError, setEACHistoryError] = React.useState();
    const [calculating, setCalculating] = React.useState(false);
    const [calculationDone, setCalculationDone] = React.useState(false);
    const [earlierLots, setEarlierLots] = React.useState<{ shares: number; acquisitionDate: Date; totalAcquisitionCost: number }[]>();
    const [parsedYearEnd, setParsedYearEnd] = React.useState<ParsedYearEndStatement | undefined>();
    const [earlierInputMode, setEarlierInputMode] = React.useState<EarlierInputMode>('none');

    const readyToCalculate = Boolean(
        individualHistory &&
        eacHistory &&
        (earlierInputMode !== 'yearEnd' || parsedYearEnd)
    );
    const hasErrors = !!individualHistoryError || !!eacHistoryError;

    const warnings = [];
    if (eacHistory && eacHistory.some(t => t.action === EAC.Action.SellToCover)) {
        warnings.push('The purchase price for shares held from a Sell To Cover transaction might not be correctly calculated.')
    }
    if (individualHistory && individualHistory.some(t => t.action === Individual.Action.CancelSell)) {
        warnings.push('The Cancel Sell transaction is currently ignored.')
    }
    if (individualHistory && individualHistory.some(t => t.action === Individual.Action.Sell)) {
        warnings.push('The sales fee when selling shares might get double counted.')
    }

    const doCalculate = async () => {
        if(!individualHistory) {
            throw new Error('Missing individual history data');
        }

        if(!eacHistory) {
            throw new Error('Missing EAC history data');
        }

        setCalculating(true);

        try {
            let ind = individualHistory;
            let eac = eacHistory;
            let lotsForCalc = earlierLots;
            let earlierEacLots: Lot[] | undefined;

            if (earlierInputMode === 'yearEnd' && parsedYearEnd) {
                const filtered = filterHistoriesAfterYearEndReport(ind, eac, parsedYearEnd.reportThroughDate);
                ind = filtered.individualHistory;
                eac = filtered.eacHistory;
                lotsForCalc = parsedYearEnd.individualLots.map(lot => ({
                    shares: lot.quantity,
                    acquisitionDate: lot.purchaseDate,
                    totalAcquisitionCost: lot.quantity * lot.purchasePriceUSD,
                }));
                earlierEacLots = parsedYearEnd.eacLots;
            }

            await onCalculate({
                individualHistory: ind,
                eacHistory: eac,
                earlierLots: lotsForCalc,
                earlierEacLots,
            });
            setCalculationDone(true);
        } catch (err: any) {
            console.error('Error while calculating.', err);
        }

        setCalculating(false);
    }

    const individualUploadProp: FileUploadProps = {
        accept: 'application/json',
        inputId: 'individual-upload',
        label: 'Individual History',
        success: !!individualHistory,
        error: !!individualHistoryError,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (
                event.target.files !== null &&
                event.target?.files?.length > 0
            ) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if(typeof event.target?.result === 'string') {
                    try {
                        const data = parseIndividualHistory(event.target?.result);
                        console.debug('History', data);
                        setIndividualHistoryError(undefined);
                        setIndividualHistory(data);
                    } catch (err: any) {
                        console.error('Failed to parse inidvidual history.', err);
                        setIndividualHistoryError(err);
                    }
                  }
                };
                reader.readAsText(event.target.files[0]);
            }
        }
    }

    const eacUploadProp: FileUploadProps = {
        accept: 'application/json',
        inputId: 'eac-upload',
        label: 'Equity Award Center History',
        success: !!eacHistory,
        error: !!eacHistoryError,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (
                event.target.files !== null &&
                event.target?.files?.length > 0
            ) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if(typeof event.target?.result === 'string') {
                    try {
                        const data = parseEACHistory(event.target?.result);
                        console.debug('EAC History', data);
                        setEACHistoryError(undefined);
                        setEACHistory(data);
                    } catch (err: any) {
                        console.error('Failed to parse EAC history.', err);
                        setEACHistoryError(err);
                    }
                  }
                };
                reader.readAsText(event.target.files[0]);
            }
        },
    }

    return <Box sx={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Typography textAlign={'center'} variant={'h4'} gutterBottom>Input</Typography>
        <ErrorAlert display={hasErrors} error={individualHistoryError || eacHistoryError}/>
        <WarningAlert display={warnings.length > 0} warnings={warnings}/>
        <Box sx={{
            display: 'flex',
            justifyContent: 'center'
        }}>
            <FileUpload {...individualUploadProp}></FileUpload>
            <Box width={'1em'}></Box>
            <FileUpload {...eacUploadProp}></FileUpload>
        </Box>
        {individualHistory || eacHistory ? <AdditionalInformation 
            individualHistory={individualHistory}
            eacHistory={eacHistory}
            onLotsChange={setEarlierLots}
            onYearEndStatementChange={setParsedYearEnd}
            onEarlierInputModeChange={setEarlierInputMode}
            yearEndStatementLoaded={!!parsedYearEnd}
        /> : null}
        <CalculateButton
            onClick={doCalculate}
            disabled={!readyToCalculate}
            success={calculationDone}
            loading={calculating}
        />
    </Box>
}