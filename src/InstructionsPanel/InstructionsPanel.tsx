import React from "react"
import { Container } from '@mui/system';
import { Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import EuroIcon from '@mui/icons-material/Euro';

export type InstructionsPanelProps = {}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = () => {
    const GithubIssueLink = (props: {children: React.ReactNode}) => <Link 
        href='https://github.com/hanzki/rsu-tax-calculator/issues/new'
        target='_blank'
        rel='noreferrer'
    >{props.children}</Link>
    const SchwabLink = (props: {children: React.ReactNode}) => <Link 
        href='https://www.schwab.com/client-home'
        target='_blank'
        rel='noreferrer'
    >{props.children}</Link>
    const ECBLink = (props: {children: React.ReactNode}) => <Link 
        href='https://sdw-wsrest.ecb.europa.eu/help/'
        target='_blank'
        rel='noreferrer'
    >{props.children}</Link>
    const HighlightsListItem = (props: {children: React.ReactNode, icon: JSX.Element}) => <ListItem>
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText 
            primaryTypographyProps={{fontWeight: 'bold'}}
        >{props.children}</ListItemText>
    </ListItem>
    const InstructionStep = (props: {children: React.ReactNode, index: number}) => <ListItem>
        <ListItemIcon sx={{
            color: 'text.primary',
            fontWeight: 'bold',
            alignSelf: 'flex-start',
            mt: 0.5
        }}>{props.index}.</ListItemIcon>
        <ListItemText>{props.children}</ListItemText>
    </ListItem>
    const Emph = (props: {children: React.ReactNode}) => <Typography
        component='span'
        sx={{fontWeight: 'bold'}}
    >{props.children}</Typography>

    return <Container maxWidth="md">
        <Typography textAlign={'center'} gutterBottom>
            Welcome! This tool helps you reporting your income and transactions related to RSU stock grants to the tax authorities.
            I made it to help myself and my collegues to navigate their taxes.
        </Typography>
        <Alert severity="warning">
            <AlertTitle sx={{fontWeight: 'bold'}}>Warning</AlertTitle>
            This tool is still in <strong>Beta testing.</strong> There is a high likelyhood that there are bugs and
            the numbers produced by this tool are incorrect for you. Use this tool in your tax
            reporting at your own risk.<br/>If you find bugs please report them to the author or <GithubIssueLink>submit an issue on Github</GithubIssueLink>.
        </Alert>
        <Container maxWidth="sm">
            <List>
                <HighlightsListItem icon={<LanguageIcon/>}>
                    Easy to use Web UI.
                </HighlightsListItem>
                <HighlightsListItem icon={<SettingsIcon/>}>
                    Automatic processing of Schwab exports.
                </HighlightsListItem>
                <HighlightsListItem icon={<LockIcon/>}>
                    Secure in-browser processing. No data is sent to the server.
                </HighlightsListItem>
                <HighlightsListItem icon={<EuroIcon/>}>
                    Automatic currency conversions using <ECBLink>ECB API</ECBLink>.
                </HighlightsListItem>
            </List>
        </Container>
        <Typography variant='h4' textAlign={'center'}>Instructions</Typography>
        <List component='ol'>
            <InstructionStep index={1}>
                Log into your <SchwabLink>Schwab online bank</SchwabLink>.
            </InstructionStep>
            <InstructionStep index={2}>
                Navigate to the <Emph>History</Emph> page by clicking the link at the top of the page.
            </InstructionStep>
            <InstructionStep index={3}>
                Use the account selector at top left of the History page to select
                which account you want to export. You need to export both your individual
                brokerage account and the Equity Award Center account.
            </InstructionStep>
            <InstructionStep index={4}>
                Make sure the <Emph>Date Range</Emph> selector has <Emph>All</Emph> selected. If you
                need to change this remember to press the <Emph>Search</Emph> button to update the
                list.
            </InstructionStep>
            <InstructionStep index={5}>
                Press the <Emph>Export</Emph> link at the top right of the page to download
                a CSV export of the transactions. You will see a security notice which you
                need to acknowledge. No data you upload to this App is sent outside your
                browser.
            </InstructionStep>
            <InstructionStep index={6}>
                Repeat the steps 3-5 for the second account. You need to export
                both your individual brokerage account and the Equity Award Center account.
            </InstructionStep>
            <InstructionStep index={7}>
                Upload the two exported files to this App in the <Emph>Input</Emph> section.
            </InstructionStep>
            <InstructionStep index={8}>
                Press the <Emph>Calculate</Emph> button to see the results.
            </InstructionStep>
        </List>
    </Container>
}