# Quick Start: Gasket Vite Plugin App

## 🚀 One-Command Install & Run

```bash
cd /Users/jordanpina/dev/gasket-os/gasket
chmod +x INSTALL-PLUGIN-APP.sh
./INSTALL-PLUGIN-APP.sh
```

Then:
```bash
cd my-gasket-vite-app-with-plugin
npm run local
```

Open: **http://localhost:3000**

---

## 📋 Manual Installation (Step-by-Step)

If you prefer to run commands manually:

### Step 1: Install Plugin Dependencies
```bash
cd /Users/jordanpina/dev/gasket-os/gasket/packages/gasket-plugin-vite
npm install
```
**This installs `vite` that the plugin needs.**

### Step 2: Install App Dependencies
```bash
cd /Users/jordanpina/dev/gasket-os/gasket/my-gasket-vite-app-with-plugin
npm install
```
**This installs React, Gasket, Express, and links to the plugin.**

### Step 3: Run the App
```bash
npm run local
```
**Starts dev server with HMR at http://localhost:3000**

---

## 🔧 What Gets Installed

### In Plugin (`packages/gasket-plugin-vite/`)
- `vite@^5.2.0` (~50MB)

### In App (`my-gasket-vite-app-with-plugin/`)
- `@gasket/core`
- `@gasket/plugin-express`
- `@gasket/plugin-logger`
- `@gasket/plugin-vite` (links to local plugin)
- `express`
- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`

Total: ~200MB

---

## ✅ Expected Output

After installation:
```
✓ Plugin dependencies installed!
✓ App dependencies installed!
```

After running `npm run local`:
```
✨ Server ready at http://localhost:3000
📦 Using @gasket/plugin-vite for frontend
[@gasket/plugin-vite] Initializing in development mode
[@gasket/plugin-vite] Vite dev server ready with HMR
```

---

## 🎯 What You'll See

A beautiful React app showing:
- 🚀 Gasket + Vite heading
- Explanation of the plugin approach
- Benefits comparison
- Styling with gradients and colors

**Try editing `src/App.jsx` - it will hot reload instantly!** 🔥

---

## 🐛 Troubleshooting

### "Cannot find package 'vite'"
**Problem:** Plugin dependencies not installed  
**Solution:** Run step 1 above (install in plugin directory)

### Port 3000 already in use
**Solution:** 
```bash
PORT=3001 npm run local
```

### Module resolution errors
**Solution:** Clean install
```bash
cd packages/gasket-plugin-vite
rm -rf node_modules package-lock.json
npm install

cd ../../my-gasket-vite-app-with-plugin
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **Full Overview:** `VITE-PLUGIN-DEMO.md`
- **Visual Comparison:** `MANUAL-VS-PLUGIN-VISUAL.md`
- **Plugin Docs:** `packages/gasket-plugin-vite/README.md`
- **App Setup:** `my-gasket-vite-app-with-plugin/SETUP.md`
- **Comparison:** `my-gasket-vite-app-with-plugin/PLUGIN-COMPARISON.md`

---

## 🎨 Other Commands

```bash
# Build for production
npm run build

# Run production build
npm run preview
```

---

## 💡 Key Takeaway

**Manual approach:** 50 lines of integration code  
**Plugin approach:** 2 lines (just add plugin!)  

**Savings:** 96% less code to maintain! 🎉

