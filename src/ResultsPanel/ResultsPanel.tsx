import { Box, Typography } from "@mui/material"
import React from "react"
import { last, sumBy, uniq } from "lodash";
import * as Papa from 'papaparse';
import { TaxSaleOfSecurity } from "../calculator";
import { PeriodSelector } from "./PeriodSelector";
import { SaleOfSecuritiesTable } from "./SaleOfSecuritiesTable";
import { InsightCard } from "./InsightCard";
import { format } from "date-fns";

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean
    }
}

export type ResultsPanelProps = {
    taxReport: TaxSaleOfSecurity[]
}

const Spacer = () => <Box sx={{m: 1}}/>;

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
    taxReport
}) => {
    const periods = uniq(taxReport.map(t => t.saleDate.getFullYear().toString())).sort();
    if (periods.length < 1) {
        throw new Error('No data to show'); // TODO: Handle empty case better
    }

    const [period, setPeriod] = React.useState(last(periods) as string);

    const salesWithinPeriod = taxReport.filter(t => t.saleDate.getFullYear().toString() === period);
    const sharesSold = sumBy(salesWithinPeriod, t => t.quantity);
    const totalIncome = sumBy(salesWithinPeriod, t => (t.salePriceEUR * t.quantity - t.saleFeesEUR));
    const totalCost = sumBy(salesWithinPeriod, t => (t.purchasePriceEUR * t.quantity + t.purchaseFeesEUR));
    const capitalGain = sumBy(salesWithinPeriod, t => t.capitalGainEUR);
    const capitalLoss = sumBy(salesWithinPeriod, t => t.capitalLossEUR);

    const downloadReport = () => {
        const fileHeader = `Created by RSU Tax Calculator v${process.env.REACT_APP_VERSION} on ${format(new Date(), 'PPP')}`;
        const csvRows = Papa.unparse(salesWithinPeriod, {quotes: true});
        const fileContent = `"${fileHeader}"\r\n${csvRows}`;
        const filename = `rsu_sale_report_${period}_${format(new Date(), 'yyyyMMdd')}.csv`;

        // generate a file blob
        const blob = new Blob([fileContent], { type: 'text/csv' });
        
        // if navigator is present, download file immediatly
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, filename);
            return;
        }
        
        // if navigator is not present, manually create file and download
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    return <Box sx={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Typography textAlign={'center'} variant={'h4'} gutterBottom>Results</Typography>
        <PeriodSelector options={periods} selection={period} setSelection={setPeriod}/>

        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2
        }}>
            <InsightCard title="Shares Sold" valueStr={sharesSold.toString()}/>
            <Spacer/>
            <InsightCard title="Selling prices" valueEUR={totalIncome}/>
            <Spacer/>
            <InsightCard title="Acquisition expenses" valueEUR={totalCost}/>
            <Spacer/>
            <InsightCard title="Capital gains" valueEUR={capitalGain}/>
            <Spacer/>
            <InsightCard title="Capital losses" valueEUR={capitalLoss}/>
        </Box>
        <SaleOfSecuritiesTable transactions={salesWithinPeriod} onDownload={downloadReport}/>
    </Box>
};