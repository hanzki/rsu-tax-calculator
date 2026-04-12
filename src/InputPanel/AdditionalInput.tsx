import React from "react";
import { Box, Typography, FormControlLabel, Radio, RadioGroup, FormControl, TextField, Button } from "@mui/material";
import { EAC, Individual } from "../calculator/types";
import { analyzeInputData } from "../calculator/inputAnalyzer";
import { FileUpload } from "../FileUpload/FileUpload";
import { parseYearEndStatementExport, ParsedYearEndStatement } from "../parser/yearEndStatementParser";

export type EarlierInputMode = 'none' | 'manual' | 'yearEnd';

export type AdditionalInformationProps = {
    individualHistory?: Individual.Transaction[],
    eacHistory?: EAC.Transaction[]
    onLotsChange?: (lots: { shares: number; acquisitionDate: Date; totalAcquisitionCost: number }[]) => void
    onYearEndStatementChange?: (statement: ParsedYearEndStatement | undefined) => void
    onEarlierInputModeChange?: (mode: EarlierInputMode) => void
    yearEndStatementLoaded?: boolean
}

export const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
    individualHistory,
    eacHistory,
    onLotsChange,
    onYearEndStatementChange,
    onEarlierInputModeChange,
    yearEndStatementLoaded = false,
}) => {
    let individualInfo = "Not loaded";
    let eacInfo = "Not loaded";
    let earliestDate: Date | undefined;

    if (individualHistory) {
        const metadata = analyzeInputData(individualHistory);
        individualInfo = [
            metadata.firstTransactionDate.toLocaleDateString(),
            metadata.lastTransactionDate.toLocaleDateString()
        ].join(" - ");
        if (!earliestDate || metadata.firstTransactionDate < earliestDate) earliestDate = metadata.firstTransactionDate;
    }
    if (eacHistory) {
        const metadata = analyzeInputData(eacHistory);
        eacInfo = [
            metadata.firstTransactionDate.toLocaleDateString(),
            metadata.lastTransactionDate.toLocaleDateString()
        ].join(" - ");
        if (!earliestDate || metadata.firstTransactionDate < earliestDate) earliestDate = metadata.firstTransactionDate;
    }

    const [selection, setSelection] = React.useState<'containsAll' | 'hasEarlierManual' | 'hasEarlierYearEnd' | ''>('');
    const [yearEndStatementError, setYearEndStatementError] = React.useState<unknown>();

    type Lot = { id: string; shares: string; acquisitionDate: string; totalCost: string };
    const [lots, setLots] = React.useState<Lot[]>([]);

    React.useEffect(() => {
        if (selection === 'hasEarlierManual' && lots.length === 0) {
            setLots([{ id: String(Date.now()), shares: '', acquisitionDate: '', totalCost: '' }]);
        }
    }, [selection]);

    React.useEffect(() => {
        if (!onEarlierInputModeChange) return;
        if (selection === 'containsAll' || selection === '') onEarlierInputModeChange('none');
        else if (selection === 'hasEarlierManual') onEarlierInputModeChange('manual');
        else if (selection === 'hasEarlierYearEnd') onEarlierInputModeChange('yearEnd');
    }, [selection, onEarlierInputModeChange]);

    React.useEffect(() => {
        if (selection !== 'hasEarlierYearEnd') {
            onYearEndStatementChange?.(undefined);
            setYearEndStatementError(undefined);
        }
    }, [selection, onYearEndStatementChange]);

    const addLot = () => setLots(s => [...s, { id: String(Date.now()) + Math.random().toString(36).slice(2,6), shares: '', acquisitionDate: '', totalCost: '' }]);
    const removeLot = (id: string) => setLots(s => s.filter(l => l.id !== id));
    const updateLot = (id: string, field: keyof Lot, value: string) => setLots(s => s.map(l => l.id === id ? { ...l, [field]: value } : l));

    React.useEffect(() => {
        if (!onLotsChange) return;
        if (selection !== 'hasEarlierManual') {
            onLotsChange([]);
            return;
        }
        const normalized = lots.map(l => ({
            shares: l.shares === '' ? NaN : Number(l.shares),
            acquisitionDate: l.acquisitionDate ? new Date(`${l.acquisitionDate}T00:00:00`) : new Date(''),
            totalAcquisitionCost: l.totalCost === '' ? NaN : Number(l.totalCost)
        }));
        onLotsChange(normalized);
    }, [lots, selection, onLotsChange]);

    return (
        <Box sx={{ marginTop: '10px', textAlign: 'center' }}>
            <Typography variant="body2">
                Individual History:  {individualInfo} <br/>
                EAC History:  {eacInfo}
            </Typography>

            {earliestDate ? (
                <Box sx={{ marginTop: '10px' }}>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={selection}
                            onChange={(e) => setSelection(e.target.value as 'containsAll' | 'hasEarlierManual' | 'hasEarlierYearEnd' | '')}
                        >
                            <FormControlLabel
                                value="containsAll"
                                control={<Radio />}
                                label={`My account didn't hold shares acquired before ${earliestDate.toLocaleDateString()}`}
                            />
                            <FormControlLabel
                                value="hasEarlierManual"
                                control={<Radio />}
                                label={`My account had shares acquired before ${earliestDate.toLocaleDateString()} (enter lots below)`}
                            />
                            <FormControlLabel
                                value="hasEarlierYearEnd"
                                control={<Radio />}
                                label="I have a year-end statement JSON from this calculator (upload below)"
                            />
                        </RadioGroup>
                    </FormControl>

                    {selection === 'hasEarlierYearEnd' ? (
                        <Box sx={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ maxWidth: 420 }}>
                                Upload the file from <strong>Download Year-End Statement</strong> for the last year you already processed.
                                Transactions on or before the file&apos;s <strong>reportThroughDate</strong> are skipped; opening lots from the file are used instead.
                            </Typography>
                            <FileUpload
                                accept="application/json"
                                inputId="year-end-statement-upload"
                                label="Year-end statement JSON"
                                success={yearEndStatementLoaded}
                                error={!!yearEndStatementError}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    if (event.target.files === null || event.target.files.length === 0) return;
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        if (typeof e.target?.result !== 'string') return;
                                        try {
                                            const parsed = parseYearEndStatementExport(e.target.result);
                                            setYearEndStatementError(undefined);
                                            onYearEndStatementChange?.(parsed);
                                        } catch (err: unknown) {
                                            console.error('Failed to parse year-end statement.', err);
                                            setYearEndStatementError(err);
                                            onYearEndStatementChange?.(undefined);
                                        }
                                    };
                                    reader.readAsText(event.target.files[0]);
                                }}
                            />
                            {yearEndStatementError ? (
                                <Typography variant="body2" color="error" sx={{ maxWidth: 420 }}>
                                    {(yearEndStatementError as Error)?.message ?? String(yearEndStatementError)}
                                </Typography>
                            ) : null}
                        </Box>
                    ) : null}

                    {selection === 'hasEarlierManual' ? (
                        <Box sx={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ marginBottom: '8px' }}>
                                Please list all shares your account had on {earliestDate.toLocaleDateString()} grouped by acquisition lot
                            </Typography>
                            {lots.map((lot, idx) => (
                                <Box key={lot.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: 1 }}>
                                    <TextField
                                        label={`Shares`}
                                        type="number"
                                        value={lot.shares}
                                        onChange={(e) => updateLot(lot.id, 'shares', e.target.value)}
                                        size="small"
                                    />
                                    <TextField
                                        label="Acquisition date"
                                        type="date"
                                        value={lot.acquisitionDate}
                                        onChange={(e) => updateLot(lot.id, 'acquisitionDate', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                    <TextField
                                        label="Total acquisition cost ($)"
                                        type="number"
                                        inputProps={{ step: '0.01' }}
                                        value={lot.totalCost}
                                        onChange={(e) => updateLot(lot.id, 'totalCost', e.target.value)}
                                        size="small"
                                    />
                                    <Button size="small" color="error" onClick={() => removeLot(lot.id)} disabled={lots.length <= 1}>Remove</Button>
                                </Box>
                            ))}

                            <Box sx={{ marginTop: 1 }}>
                                <Button size="small" onClick={addLot}>Add lot</Button>
                            </Box>
                        </Box>
                    ) : null}
                </Box>
            ) : null}
        </Box>
    );
}