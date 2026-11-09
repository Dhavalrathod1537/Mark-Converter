# 📊 Marks to Percentage Converter

A free, open-source web application to convert academic scores between different formats. Perfect for students who need to calculate percentages from CGPA, SPI, grades, or raw marks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **CGPA to Percentage** - Convert Cumulative Grade Point Average to percentage
  - Supports 10, 4, and 5 point scales
  - Standard formula: CGPA × 9.5 (for 10-point scale)

- **SPI to Percentage** - Convert Semester Performance Index to percentage
  - Works with 10 and 4 point scales
  - Same calculation method as CGPA

- **Marks to Percentage** - Calculate percentage from total marks
  - Simple: (Obtained Marks / Total Marks) × 100
  - Works with any mark range

- **Grade to Percentage** - Convert letter grades to percentage ranges
  - O, A+, A, B+, B, C, D, F grades supported
  - Shows grade point and description
- **University formulas** - Generic, GTU, Mumbai University, VTU, and Anna University presets
- **Percentage to CGPA** - Reverse conversion on 10-, 4-, and 5-point scales
- **Semester SPI/SGPA to CGPA** - Credit-weighted overall CGPA with a locally rendered SPI chart
- **Target SPI** - Estimate the next-semester SPI needed to reach a target CGPA
- **History tools** - Persistent conversion history, individual deletion, CSV export, and WhatsApp sharing
- **WhatsApp result sharing** - Open WhatsApp with a result prefilled; choose a recipient and send it
- **Percentage reactions** - Encouraging messages based on the calculated percentage

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/marks-converter.git
   cd marks-converter
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   npx serve
   # or
   python -m http.server 8000
   ```

3. **That's it!** No installation, no dependencies, no build process.

## 💻 Usage

### Online
Visit [your-website-url.com](https://your-website-url.com) to use the calculator directly.

### Offline
Download the repository and open `index.html` in any modern web browser. Works completely offline!

## 🎯 How to Use

1. **Select a calculator** - Choose a converter, semester CGPA calculator, target SPI calculator, or history from the mode buttons:
   - CGPA to %
   - SPI to %
   - Marks to %
   - Grade to %
   - Percentage to CGPA
   - SPI/SGPA to overall CGPA
   - Target SPI
   - History

2. **Enter Your Values** - Fill in the required fields

3. **Calculate** - Click the "Calculate" button or press Enter

4. **View Results** - Your percentage will be displayed with a clear breakdown

## 📱 Responsive Design

The converter works perfectly on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📲 Tablets
- 🖥️ Any screen size

## 🔧 Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern animations
- **Vanilla JavaScript** - Logic (no frameworks needed!)

## 📂 Project Structure

```
marks-converter/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── script.js           # Conversion logic
├── README.md           # Documentation
└── LICENSE             # MIT License
```

## 🎨 Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
}
```

### Add New Conversion Types
1. Add a new button in `index.html`
2. Create a new section with input fields
3. Add calculation logic in `script.js`

## 📊 Conversion Formulas

### CGPA to Percentage
- **10-point scale:** Percentage = CGPA × 9.5
- **4-point scale:** Percentage = (CGPA / 4) × 100
- **5-point scale:** Percentage = (CGPA / 5) × 100
- University presets include IIT, GTU scheme variants, Gujarat University, Mumbai University, SPPU, Anna University, VTU scheme variants, Delhi University, AICTE, Parul, and Nirma.
- **US 4.0 GPA:** Percentage = (GPA / 4) × 100

The selector displays each formula's confidence and caveat. University formulas may vary by course and regulation year; confirm with your institution before using a result officially. IIT Bombay's CPI conversion is notional. The Nirma CGPA × 10 preset could not be verified against an official source and is clearly marked as unverified. Non-generic Indian formulas require a 10-point scale; the US GPA preset requires a 4-point scale.

### Semester CGPA and target SPI
```
Overall CGPA = sum(SPI × semester credits) / sum(semester credits)
Required next SPI = (target CGPA × total future credits - current CGPA × completed credits) / next-semester credits
```

Semester SPI and credit entries are stored locally in the browser. The chart is rendered with SVG and does not load external libraries.

### Marks to Percentage
```
Percentage = (Obtained Marks / Total Marks) × 100
```

### Grade Points
| Grade | Points | Percentage |
|-------|--------|------------|
| O     | 10     | 90-100%    |
| A+    | 9      | 80-89%     |
| A     | 8      | 70-79%     |
| B+    | 7      | 60-69%     |
| B     | 6      | 50-59%     |
| C     | 5      | 40-49%     |
| D     | 4      | 35-39%     |
| F     | 0      | Below 35%  |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Ideas for Contributions
- Add more grading systems (international standards)
- Support for percentage to CGPA conversion
- Dark mode toggle
- Print/Export functionality
- Multiple language support
- History of conversions
- Batch conversion tool

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Marks Converter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🙏 Acknowledgments

- Built with ❤️ for students
- Inspired by the need for simple, accessible academic tools
- Thanks to all contributors!

## 📧 Contact

Have questions or suggestions? Feel free to:
- Open an issue on GitHub
- Submit a pull request
- Star ⭐ the repository if you find it helpful!

## 🌟 Star History

If this project helped you, please consider giving it a star! It helps others discover the tool.

---

**Made with ❤️ for students worldwide** 🎓
