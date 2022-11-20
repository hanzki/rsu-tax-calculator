import { Box, Link, Typography } from '@mui/material';
import CopyrightIcon from '@mui/icons-material/Copyright';
import GitHubIcon from '@mui/icons-material/GitHub';
import CircleIcon from '@mui/icons-material/Circle';

export const Footer = () => {
    const Separator = () => <CircleIcon sx={{
        color: 'text.secondary',
        fontSize: 10,
        ml: 2,
        mr: 2,
        pb: 0.2
    }}/>

    return <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        mt: 4,
        pb: 4
    }}>
        
        <Typography color={'text.secondary'} fontSize='small'>
            <CopyrightIcon sx={{fontSize: 14}}/> Hannu Huhtanen {new Date().getFullYear()}
        </Typography>
        <Separator/>
        <Link
            href='https://github.com/hanzki/rsu-tax-calculator'
            target='_blank'
            rel='noreferrer'
            underline='none'
            color={'text.secondary'}
            fontSize='small'
        ><GitHubIcon sx={{fontSize: 18}}/> Github</Link>
        <Separator/>
        <Link
            href='https://github.com/hanzki/rsu-tax-calculator/blob/master/LICENSE.md'
            target='_blank'
            rel='noreferrer'
            underline='none'
            color={'text.secondary'}
            fontSize='small'
        >MIT License</Link>
    </Box>
}