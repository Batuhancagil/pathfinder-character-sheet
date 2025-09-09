# Pathfinder 2e Mobile Character Sheet

A responsive, mobile-friendly character sheet application for Pathfinder 2nd Edition, built with vanilla HTML, CSS, and JavaScript. This project is designed to work seamlessly on both desktop and mobile devices, providing an intuitive interface for managing your Pathfinder characters.

## Features

### 📱 Mobile-First Design
- Responsive layout that works perfectly on phones, tablets, and desktops
- Touch-friendly interface with large, easy-to-tap buttons
- Optimized for portrait and landscape orientations
- Fast loading and smooth animations

### 🎲 Interactive Character Management
- **Overview Tab**: Core statistics, ability scores, saving throws, and skills
- **Spells Tab**: Spell slots, prepared spells organized by level
- **Equipment Tab**: Money tracking and equipment management
- **Feats Tab**: Complete list of character feats and abilities

### 🎯 Smart Calculations
- Automatic calculation of ability modifiers
- HP calculation based on level, class, and Constitution
- Saving throw calculations with proficiency bonuses
- Skill calculations with proper ability score modifiers

### 🎲 Built-in Dice Roller
- Roll d20, d4, d6, d8, d10, d12 with a single tap
- Click on ability scores to roll d20 + modifier
- Visual feedback with smooth animations
- Always accessible floating dice roller

### 📊 Pathbuilder Integration
- Import character data directly from Pathbuilder 2e JSON exports
- Supports all major character elements: stats, spells, feats, equipment
- Maintains compatibility with Pathbuilder's data structure

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A character exported from [Pathbuilder 2e](https://pathbuilder2e.com/)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd pathfinder-character-sheet
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or serve it using a local web server for better performance

3. **Import your character**
   - Export your character from Pathbuilder 2e as JSON
   - Replace the `characterData` object in `script.js` with your character's data
   - Refresh the page to see your character

### Using a Local Web Server (Recommended)

For the best experience, especially on mobile devices, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Character Data Structure

The application expects character data in Pathbuilder 2e's JSON format. Key elements include:

- **Basic Info**: Name, class, level, ancestry, background
- **Abilities**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Proficiencies**: Skill proficiencies and saving throw bonuses
- **Spellcasting**: Spell slots, prepared spells, and spell traditions
- **Feats**: All character feats with descriptions
- **Equipment**: Money and equipment tracking

## Mobile Optimization

### Touch Interface
- Large, easy-to-tap buttons and interactive elements
- Swipe-friendly tab navigation
- Optimized spacing for finger navigation

### Performance
- Lightweight vanilla JavaScript (no frameworks)
- Efficient DOM manipulation
- Smooth CSS animations and transitions
- Fast loading on mobile networks

### Responsive Design
- Flexible grid layouts that adapt to screen size
- Scalable text and icons
- Optimized for both portrait and landscape modes
- Works on devices from 320px to 1920px+ width

## Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (iOS and macOS)
- **Edge**: Full support
- **Mobile browsers**: Full support on iOS Safari and Chrome Mobile

## Future Enhancements

### Planned Features
- [ ] Multiple character support
- [ ] Character comparison tools
- [ ] Offline storage with localStorage
- [ ] Print-friendly character sheets
- [ ] Custom dice rolling with modifiers
- [ ] Initiative tracking
- [ ] Combat tracker
- [ ] Spell slot tracking during play

### Mobile App Development
This web application is designed to be easily converted into native mobile apps:
- **React Native**: Convert to cross-platform mobile app
- **Cordova/PhoneGap**: Package as hybrid mobile app
- **Progressive Web App**: Add PWA features for app-like experience

## Contributing

Contributions are welcome! Areas where help is needed:

1. **UI/UX Improvements**: Better mobile interface design
2. **Feature Development**: New character management features
3. **Pathbuilder Integration**: Better data import/export
4. **Performance**: Optimization for older mobile devices
5. **Accessibility**: Screen reader and keyboard navigation support

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Pathbuilder 2e**: For the excellent character builder and JSON export format
- **Paizo**: For creating the amazing Pathfinder 2nd Edition system
- **Pathfinder Community**: For feedback and feature suggestions

## Support

If you encounter any issues or have suggestions for improvements, please:

1. Check the browser console for any JavaScript errors
2. Ensure your character data is in the correct Pathbuilder format
3. Try refreshing the page or clearing browser cache
4. Open an issue on the project repository

---

**Happy adventuring!** 🗡️⚔️🛡️
