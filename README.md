# Street Bites Food Truck - Moment 5

Ett "food truck"-projekt med REST API, admin-gränssnitt och sedan publik webbplats för Street Bites.

## Projektöversikt

Street Bites är en modern food truck som serverar hamburgare, tacos och pommes på olika platser i Stockholm. Projektet består av tre huvudkomponenter:

1. **REST API** - Backend-webbtjänst med MongoDB
2. **Admin-gränssnitt** - Administrationspanel för personal
3. **Publik webbplats** - Kundwebbplats (moment5_2)

## Teknisk

### Backend (REST API)

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Databas
- **Mongoose** - ODM
- **JWT** - Autentisering
- **bcryptjs** - Lösenordshashing
- **express-validator** - Input-validering
- **helmet** - Säkerhetsheaders
- **cors** - Cross-origin requests
- **express-rate-limit** - Rate limiting

### Frontend (admin & publik)

- **HTML5** - Markup
- **CSS3** - Styling med responsiv design
- **JavaScript** - Interaktivitet
- **Fetch API** - API-kommunikation

## Databasmodeller

### User

- `username` - Användarnamn
- `email` - E-postadress (unik)
- `password` - Krypterat lösenord
- `role` - Användarroll (admin/user)
- `createdAt`, `updatedAt` - Tidsstämplar

### MenuCategory

- `name` - Kategorinamn
- `description` - Beskrivning
- `displayOrder` - Sorteringsordning
- `isActive` - Aktiv status

### MenuItem

- `name` - Maträttsnamn
- `description` - Beskrivning
- `price` - Pris
- `categoryId` - Referens till kategori
- `image` - Bild-URL
- `isAvailable` - Tillgänglighet
- `allergens` - Allergener (array)
- `preparationTime` - Tillagningstid

### Order

- `orderNumber` - Automatiskt genererat nummer
- `customerName` - Kundnamn
- `phone` - Telefonnummer
- `email` - E-postadress
- `items` - Beställda maträtter
- `totalAmount` - Totalsumma
- `status` - Orderstatus
- `estimatedReadyTime` - Beräknad tid

### Location

- `name` - Platsnamn
- `address` - Adress
- `coordinates` - GPS-koordinater
- `schedule` - Öppettider
- `isActive` - Aktiv status

## API Endpoints

### Autentisering

- `POST /api/auth/register` - Registrera användare
- `POST /api/auth/login` - Logga in

### Meny (Publik)

- `GET /api/menu/categories` - Hämta kategorier
- `GET /api/menu/items` - Hämta alla maträtter
- `GET /api/menu/items/category/:id` - Hämta maträtter per kategori

### Meny (Admin)

- `POST /api/menu/categories` - Skapa kategori
- `PUT /api/menu/categories/:id` - Uppdatera kategori
- `DELETE /api/menu/categories/:id` - Ta bort kategori
- `POST /api/menu/items` - Skapa maträtt
- `PUT /api/menu/items/:id` - Uppdatera maträtt
- `DELETE /api/menu/items/:id` - Ta bort maträtt

### Beställningar

- `POST /api/orders` - Skapa beställning
- `GET /api/orders` - Hämta alla beställningar (admin)
- `GET /api/orders/:id` - Hämta beställning
- `PUT /api/orders/:id/status` - Uppdatera status

### Platser

- `GET /api/locations` - Hämta alla platser
- `GET /api/locations/active` - Hämta aktiva platser

### Skyddade Routes

- `GET /api/protected` - Test-endpoint
- `GET /api/protected/profile` - Användarprofil

## Installation och Setup

### Lokal utveckling

1. **Klona repository:**

```bash
git clone https://github.com/ellenliden/DT207G_moment5.git
cd DT207G_moment5
```

2. **Installera dependencies:**

```bash
cd backend
npm install
```

3. **Konfigurera miljövariabler:**

```bash
cp env.example .env
# Redigera .env med rätt värden
```

4. **Starta servern:**

```bash
npm run dev
```

### Miljövariabler (.env)

```env
MONGODB_URI=mongodb://localhost:27017/street-bites
JWT_SECRET=-hemlig-jwt-nyckel
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
```

## Deployment

### Backend (Render.com)

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Admin-gränssnitt (Netlify)

- **Root Directory:** `admin`
- **Build Command:** `lämnas tom`
- **Publish Directory:** `admin`

## Säkerhet

- **JWT-autentisering** för skyddade endpoints
- **bcryptjs** för lösenordshashing
- **helmet** för säkerhetsheaders
- **express-rate-limit** för brute force-skydd
- **Input-validering** med express-validator
- **CORS** konfigurerad för säkerhet

## Design och UX

### Grafisk Profil

- **Primär färg:** #017963 (grön)
- **Sekundär färg:** #FFC042 (gul)
- **Typografi:** Inter font family
- **Design:** Minimalistisk och modern

### Responsiv Design

- **Mobile-first** approach
- **Hamburger-meny** för mobil/tablet
- **Flexbox och Grid** för layout
- **Breakpoints:** 768px, 480px

## Testning

### API-testning med curl

```bash
# Registrera användare
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@streetbites.se","password":"test123"}'

# Logga in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@streetbites.se","password":"test123"}'

# Hämta kategorier
curl http://localhost:3000/api/menu/categories
```

## Admin-gränssnitt

### Funktioner

- **Inloggning** med JWT-autentisering
- **Dashboard** med statistik
- **Menyhantering** med CRUD-operationer
- **Responsiv design** för alla enheter
- **Modal-formulär** för redigering

### Test-användare

- **E-post:** test@streetbites.se
- **Lösenord:** test123

## Utvecklingsstatus

### Implementerat

- REST API med alla endpoints
- Admin-gränssnitt med menyhantering
- JWT-autentisering och säkerhet
- Responsiv design
- MongoDB-integration

### Under utveckling

- Beställningshantering (orders.html)
- Platshantering (locations.html)

### Ytterligare förslag för framtiden

- Eget bildbibliotek med bilduppladdning
- E-postnotifikationer
- Sökfunktion
- Rapporter och statistik
- Live-positioner (gps & karta)

## Utvecklare

**Ellen Liden**

elli1807@student.miun.se
