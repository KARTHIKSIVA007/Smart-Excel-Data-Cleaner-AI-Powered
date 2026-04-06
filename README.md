# DataClean AI

DataClean AI is a browser-based Smart Excel Data Cleaner built as a Business Analyst portfolio project. A user can upload a messy Excel or CSV file, let the app detect column types automatically, review the cleaning plan, compare original vs cleaned data, and download only the cleaned output.

## Highlights

- Uploads `.csv`, `.xlsx`, and `.xls` files directly in the browser
- No backend, no installation, no build step
- Intelligent column detection for names, emails, phones, dates, addresses, cities, states, pincodes, amounts, percentages, gender, and general text
- Indian state and city normalization with abbreviation handling and fuzzy matching via Fuse.js
- Automatic cleaning rules with flagged review states for uncertain values
- Before/after comparison with row-level and cell-level status highlighting
- Duplicate detection with configurable handling
- One-click download of clean data only
- Built with only HTML, CSS, and Vanilla JavaScript

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- [SheetJS](https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js)
- [Fuse.js](https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js)

## Files

- `index.html`
- `style.css`
- `script.js`

## How To Run

1. Download or clone this project.
2. Open `index.html` in any modern browser.
3. Upload a CSV or Excel file, or use the sample messy dataset.

No server is required.

## User Flow

1. Upload a file or try the generated sample dataset
2. Watch the scan animation while the app analyses columns
3. Review detected column types and choose which columns to clean
4. Review the cleaning plan and adjust output settings
5. Compare original and cleaned data
6. Download the cleaned file

## Key Features

### 1. Smart Column Detection

The app detects likely data types using:

- Column header keywords
- Sample values
- Pattern matching for emails, phones, dates, amounts, percentages, and pincodes
- State and city dictionaries for Indian data

### 2. Intelligent Cleaning Rules

The app can automatically:

- Fix casing and spacing in names
- Normalize mobile numbers to standard 10-digit formats
- Lowercase emails and correct common domain typos
- Standardize mixed date formats
- Clean addresses and highlight missing pincodes
- Expand Indian state abbreviations to official names
- Normalize city aliases and common misspellings
- Parse salary and amount values from mixed formats like `₹1,20,000`, `1.2 Lakhs`, or `Rs. 120000`
- Standardize gender values

### 3. Duplicate Handling

Supports:

- Keep first, remove rest
- Keep last, remove rest
- Highlight only

### 4. Clean Download Output

The exported file includes:

- One sheet only: `Cleaned Data`
- Original headers preserved
- Duplicate rows removed based on the chosen rule
- Only cleaned values in the final file

The exported file does not include:

- Audit sheets
- Original data sheets
- Separate flagged rows sheets

## Sample Dataset

The app includes an in-memory sample data generator with 150 rows containing intentional issues such as:

- Inconsistent name formatting
- Invalid and mixed-format phone numbers
- Email typos and invalid emails
- Mixed date formats
- State and city spelling variations
- Salary values in multiple formats
- Address formatting issues
- Seeded duplicates

## Keyboard Shortcuts

- `Ctrl + U`: Open file picker
- `Ctrl + Enter`: Proceed to the next step
- `Esc`: Go back
- `Ctrl + D`: Download cleaned file on the comparison screen

## Responsive Design

- Desktop: two-column layouts and split comparison view
- Tablet: adaptive two-column layout with scrollable tables
- Mobile: single-column cards and horizontal table scrolling

## Project Purpose

This project is designed to demonstrate:

- Business Analyst thinking around messy real-world data
- Data quality issue detection and remediation workflows
- Clean frontend UX for file-based data review
- Strong browser-side problem solving without backend dependencies

## Future Improvements

- Manual inline cell editing before download
- More global dictionaries for cities and addresses
- Custom duplicate key selection by the user
- Advanced rule explanations and audit export
- Better support for very large files with virtualized tables

## Author

Business Analyst portfolio project by Karthick.
