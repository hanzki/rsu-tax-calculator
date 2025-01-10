# Change Log

## v0.11.0-beta
* Fixed bug in calculation logic that couldn't match sales if the shares were received on the same day.
* Added support for new transaction types due to changes in tax processing. (Forced Disbursement and Forced Quick Sell).
* Added warning about Schawb supporting only 4 years of history.

## v0.10.0-beta
* Changed ESPP cost basis calculator logic to correctly discount the Finnish 10% tax free portion. This effectively lowers the cost basis resulting in higher capital gain numbers
* Added number formatting in the CSV export limiting the number of decimal places in the output file

## v0.9.0-beta
* Rewrote the file parsing to work off the new Schwab JSON exports instead of CSV files

## v0.8.2-beta
* Fixed bug which prevented currency conversions for transactions that happened on weekends

## v0.8.1-beta
* Improved CSV formatting to avoid timezone errors with dates

## v0.8.0-beta
* Added support for calculating sale of ESPP shares

## v0.7.2-beta
* Fixed bug in parsing for ESPP Sale events with multiple detail rows

## v0.7.1-beta
* Added parsing support for NRA Tax Adj transactions

## v0.7.0-beta
* Added calculation support for ExerciseAndSell transactions.
* Added calculation support for SellToCover transactions.
* Added parsing suppport for CancelSell transactions.
* Added UI warnings for known issues with the calculator.

## v0.6.1-beta
* Aligned some of the terminology with OmaVero.
* Made the version number a link to the changelog.

## v0.6.0-beta
* Added support for Security Transfer transactions.
* Added extra validation for unsupported data.

## v0.5.0-beta
* Improved displaying of errors in case of parsing or calucation errors.
* Adopted more accurate type definitions in the codebase.

## v0.4.1-beta
* Fixed bug that crashed calculating for users who had completely sold all their shares.
