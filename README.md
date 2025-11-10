# 🐦 Bangalore Birdie

A Flappy Bird style game featuring iconic Bangalore challenges! Navigate through the notorious obstacles that every Bangalorean knows too well.

## 🎮 Play the Game

[Play Bangalore Birdie](https://devonepao.github.io/bangalore-birdie/)

## 🌟 Features

- **Responsive Design**: Optimized for both mobile horizontal and desktop fullscreen modes
- **Touch & Keyboard Controls**: 
  - Desktop: Press SPACE or Click to fly
  - Mobile: Tap to fly
- **Bangalore-Themed Obstacles**: Navigate through 10 different challenges that increase in difficulty:
  - Traffic Signal (Score 0+)
  - Pothole (Score 3+)
  - Auto Rickshaw (Score 6+)
  - Construction Zone (Score 9+)
  - Flooded Street (Score 12+)
  - Cow on Road (Score 15+)
  - Peak Hour Traffic (Score 18+)
  - Broken Footpath (Score 21+)
  - Metro Construction (Score 24+)
  - Silk Board Junction (Score 27+) - The ultimate challenge!
- **Progressive Difficulty**: Game speed increases and gap between obstacles decreases as your score goes up
- **Beautiful UI**: Gradient backgrounds and smooth animations

## 🎯 How to Play

1. Click or tap "Start Game"
2. Click, tap, or press SPACE to make the bird fly
3. Avoid the obstacles (pipes) that appear
4. Each obstacle you pass increases your score
5. Try to unlock all 10 Bangalore-themed obstacles!

## 🛠️ Technical Details

Built with vanilla HTML5, CSS3, and JavaScript:
- HTML5 Canvas for game rendering
- Responsive viewport configuration for mobile devices
- CSS Grid and Flexbox for layout
- Pure JavaScript game engine with:
  - Physics simulation (gravity, jump mechanics)
  - Collision detection
  - Dynamic obstacle generation
  - Score tracking and difficulty scaling

## 📱 Device Support

- ✅ Desktop (fullscreen optimized)
- ✅ Mobile Portrait
- ✅ Mobile Landscape (recommended for best experience)
- ✅ Tablet devices

## 🚀 Local Development

1. Clone the repository:
```bash
git clone https://github.com/devonepao/bangalore-birdie.git
cd bangalore-birdie
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server
```

3. Navigate to `http://localhost:8080`

## 📄 Files

- `index.html` - Main HTML structure
- `style.css` - Responsive styling and animations
- `game.js` - Game engine and logic

## 🎨 Customization

You can easily customize the game by editing `game.js`:
- Modify `CONFIG` object to adjust game physics
- Edit `BANGALORE_OBSTACLES` array to add/modify obstacles
- Change colors in the `Obstacle` class draw method

## 📝 License

This is an open-source project created for entertainment purposes.

## 🙏 Acknowledgments

Inspired by the classic Flappy Bird game and the daily commute experiences of Bangalore residents!
