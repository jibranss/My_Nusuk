import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: 'Laptop Gaming', price: 15000000 },
  { id: 2, name: 'Mouse Wireless', price: 250000 }
];

// GET: Ambil semua produk
app.get('/api/products', (req, res) => {
  res.status(200).json({ status: 'success', data: products });
});

// POST: Tambah produk baru
app.post('/api/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ status: 'fail', message: 'Nama dan harga wajib diisi' });
  }
  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    name,
    price: Number(price)
  };
  products.push(newProduct);
  res.status(201).json({ status: 'success', data: newProduct });
});

// PUT: Edit produk
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'fail', message: 'Produk tidak ditemukan' });
  }

  products[index] = {
    id,
    name: name || products[index].name,
    price: price ? Number(price) : products[index].price
  };
  res.status(200).json({ status: 'success', data: products[index] });
});

// DELETE: Hapus produk
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter((p) => p.id !== id);
  res.status(200).json({ status: 'success', message: 'Produk dihapus' });
});

app.listen(PORT, () => {
  console.log(`Server API berjalan di http://localhost:${PORT}`);
});