import React from "react";
import { Box, Typography, FormControlLabel, Radio, RadioGroup, FormControl, TextField, Button } from "@mui/material";
import { EAC, Individual } from "../calculator/types";
import { analyzeInputData } from "../calculator/inputAnalyzer";

export type AdditionalInformationProps = {
    individualHistory?: Individual.Transaction[],
    eacHistory?: EAC.Transaction[]
    onLotsChange?: (lots: { shares: number; acquisitionDate: Date; totalAcquisitionCost: number }[]) => void
}

export const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
    individualHistory,
    eacHistory,
    onLotsChange
}) => {
    let individualInfo, eacInfo = "Not loaded";
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

    const [selection, setSelection] = React.useState<'containsAll' | 'hasEarlier' | ''>('');

    type Lot = { id: string; shares: string; acquisitionDate: Date | null; totalCost: string };
    const [lots, setLots] = React.useState<Lot[]>([]);

    React.useEffect(() => {
        if (selection === 'hasEarlier' && lots.length === 0) {
            setLots([{ id: String(Date.now()), shares: '', acquisitionDate: null, totalCost: '' }]);
        }
    }, [selection]);

    const addLot = () => setLots(s => [...s, { id: String(Date.now()) + Math.random().toString(36).slice(2,6), shares: '', acquisitionDate: null, totalCost: '' }]);
    const removeLot = (id: string) => setLots(s => s.filter(l => l.id !== id));
    const updateLot = (id: string, field: keyof Lot, value: string | Date | null) => setLots(s => s.map(l => l.id === id ? { ...l, [field]: value } : l));

    React.useEffect(() => {
        if (!onLotsChange) return;
        if (selection !== 'hasEarlier') {
            onLotsChange([]);
            return;
        }
        const normalized = lots.map(l => ({
            shares: l.shares === '' ? NaN : Number(l.shares),
            acquisitionDate: l.acquisitionDate || new Date(),
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
                            onChange={(e) => setSelection(e.target.value as 'containsAll' | 'hasEarlier' | '')}
                        >
                            <FormControlLabel
                                value="containsAll"
                                control={<Radio />}
                                label={`My account didn't hold shares acquired before ${earliestDate.toLocaleDateString()}`}
                            />
                            <FormControlLabel
                                value="hasEarlier"
                                control={<Radio />}
                                label={`My account had shares acquired before ${earliestDate.toLocaleDateString()}`}
                            />
                        </RadioGroup>
                    </FormControl>

                    {selection === 'hasEarlier' ? (
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
                                        value={lot.acquisitionDate ? lot.acquisitionDate.toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateLot(lot.id, 'acquisitionDate', e.target.value ? new Date(e.target.value) : null)}
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