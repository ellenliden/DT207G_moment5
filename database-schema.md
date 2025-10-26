# Street Bites - Database Schema

## Översikt

Detta dokument beskriver databasstrukturen för Street Bites food truck-webbplatsen. Databasen använder MongoDB med Mongoose ODM.

## Databas-modeller

### Users (administratörer)

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (admin/manager, default: "admin"),
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Administratörer som kan logga in och hantera webbplatsen.

### MenuCategories

```javascript
{
  _id: ObjectId,
  name: String (required, t.ex. "Burgers", "Tacos", "Drinks"),
  description: String,
  displayOrder: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Kategorisering av meny-items (Burgers, Tacos, Drinks, etc.).

### MenuItems

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  categoryId: ObjectId (ref: MenuCategory, required),
  image: String (URL),
  isAvailable: Boolean (default: true),
  isPopular: Boolean (default: false),
  allergens: [String],
  preparationTime: Number (minutes, default: 15),
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Individuella maträtter som visas på menyn.

### Orders - Beställningar

```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, required),
  customerName: String (required),
  phone: String (required),
  email: String,
  items: [{
    menuItemId: ObjectId (ref: MenuItem),
    name: String,
    quantity: Number (min: 1),
    price: Number
  }],
  totalAmount: Number (required),
  status: String (pending/preparing/ready/completed, default: "pending"),
  estimatedReadyTime: Date,
  specialInstructions: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Kundbeställningar för take away.

### Locations

```javascript
{
  _id: ObjectId,
  name: String (required, t.ex. "City Center", "Tech Park"),
  address: String (required),
  coordinates: {
    lat: Number,
    lng: Number
  },
  schedule: [{
    day: String (monday/tuesday/etc.),
    startTime: String (HH:MM),
    endTime: String (HH:MM),
    isActive: Boolean (default: true)
  }],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Var food trucken finns och när den är öppen.

### eventuellt tar jag med Recensioner

```javascript
{
  _id: ObjectId,
  customerName: String (required),
  email: String,
  rating: Number (required, min: 1, max: 5),
  comment: String,
  orderId: ObjectId (ref: Order),
  isApproved: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Användning:** Kundrecensioner som kan godkännas av admin.

## Relationer

- **MenuItems** → **MenuCategories** (many-to-one)
- **Orders** → **MenuItems** (many-to-many via items array)
- **Reviews** → **Orders** (one-to-one, optional)

## Indexer

bra för prestandan:

- `users.email` (unique)
- `users.username` (unique)
- `menuItems.categoryId`
- `menuItems.isAvailable`
- `orders.status`
- `orders.createdAt`
- `locations.isActive`
