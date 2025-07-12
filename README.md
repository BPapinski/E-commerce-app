# 🛍️ E-Commerce Platform

Nowoczesna aplikacja e-commerce zbudowana w oparciu o **Django** oraz **React**. Projekt ma na celu stworzenie w pełni funkcjonalnej platformy sprzedażowej z panelem administracyjnym, integracją płatności i dynamicznym interfejsem użytkownika.

---

## 📦 Technologie

### Backend – Django & Django REST Framework
- Obsługa API RESTful
- Autoryzacja JWT
- Obsługa użytkowników, koszyka, zamówień, płatności
- Admin panel do zarządzania produktami i użytkownikami

### Frontend – React
- Dynamiczny interfejs użytkownika z wykorzystaniem React Hooks
- Integracja z backendem przez REST API
- System routingowy (React Router)
- Responsywny design (własny CSS)

---

## ⚙️ Funkcjonalności

- ✅ Rejestracja i logowanie użytkownika
- ✅ Przeglądanie produktów i kategorii
- ✅ Filtry i wyszukiwarka
- ✅ Koszyk zakupowy (dodawanie, edycja, usuwanie, checkout)
- ✅ Proces składania zamówienia (tworzenie zamówienia z koszyka, historia zamówień)
- ✅ Płatności online: PayPal, karta płatnicza, BLIK (integracja Stripe/PayPal, BLIK w przygotowaniu)
- ✅ Ulubione produkty (dodawanie, usuwanie, lista ulubionych)
- ✅ Panel administratora/sprzedawcy do zarządzania produktami
- ✅ Panel użytkownika (moje produkty, moje zamówienia, moje ulubione)
- ✅ System ocen i recenzji produktów (w przygotowaniu)
- ✅ Responsywny, nowoczesny interfejs (CSS Modules, React Router)
---
## 🚀 Uruchomienie projektu lokalnie

### Backend (Django)

```bash
# Stwórz i aktywuj środowisko wirtualne
python -m venv venv
venv\Scripts\activate  # Windows
# lub source venv/bin/activate na Linux/Mac

# Instalacja zależności
pip install -r requirements.txt

# Migracje bazy danych i uruchomienie serwera
cd backend/siteapi
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd ../../
npm install
npm start
```

Frontend dostępny pod: http://localhost:3000
Backend API pod: http://127.0.0.1:8000

---

## 🔗 Najważniejsze endpointy API

- `/api/store/products/` – lista produktów
- `/api/store/product/<id>` – szczegóły produktu
- `/api/store/cart/` – pobierz koszyk
- `/api/store/cart/add/` – dodaj do koszyka
- `/api/store/cart/item/<id>/` – edytuj/usuń pozycję w koszyku
- `/api/store/order/create/` – utwórz zamówienie z koszyka
- `/api/store/orders/me/` – moje zamówienia
- `/api/store/favourite/list/` – lista ulubionych produktów
- `/api/store/favourite/add/<product_id>/` – dodaj do ulubionych
- `/api/store/favourite/remove/<product_id>/` – usuń z ulubionych
- `/api/auth/register/` – rejestracja
- `/api/auth/login/` – logowanie

---

## 📝 Opis projektu

Platforma e-commerce z panelem użytkownika i sprzedawcy, obsługą koszyka, zamówień, ulubionych, JWT, nowoczesnym UI i pełną integracją backendu z frontendem. Projekt gotowy do rozbudowy o płatności, recenzje, powiadomienia i inne funkcje.
