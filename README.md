# 🛍️ E-Commerce Platform

Nowoczesna aplikacja e-commerce zbudowana w oparciu o **Django** oraz **React**. Projekt ma na celu stworzenie w pełni funkcjonalnej platformy sprzedażowej z panelem administracyjnym, integracją płatności, dynamicznym interfejsem użytkownika oraz systemem powiadomień o interakcjach dotyczących produktów zalogowanego użytkownika.

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
- ✅ System powiadomień o interakcjach z produktami użytkownika (np. nowe recenzje, zakup produktu przez innego użytkownika)  
- ✅ Responsywny, nowoczesny interfejs (CSS Modules, React Router)  

---

## 🚀 Uruchomienie projektu lokalnie

### Backend (Django)
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# lub source venv/bin/activate na Linux/Mac

pip install -r requirements.txt

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

## 🔗 Endpointy API
```plaintext
GET     /api/store/products/                # lista produktów
GET     /api/store/product/<id>/            # szczegóły produktu
GET     /api/store/cart/                    # pobierz koszyk
POST    /api/store/cart/add/                # dodaj do koszyka
PUT     /api/store/cart/item/<id>/          # edytuj pozycję w koszyku
DELETE  /api/store/cart/item/<id>/          # usuń pozycję z koszyka
POST    /api/store/order/create/            # utwórz zamówienie z koszyka
GET     /api/store/orders/me/               # moje zamówienia

GET     /api/store/favourite/list/          # lista ulubionych produktów
POST    /api/store/favourite/add/<id>/      # dodaj do ulubionych
DELETE  /api/store/favourite/remove/<id>/   # usuń z ulubionych

GET     /api/notifications/                 # powiadomienia użytkownika

POST    /api/auth/register/                 # rejestracja
POST    /api/auth/login/                    # logowanie
## 📝 Opis projektu

Platforma e-commerce z panelem użytkownika i sprzedawcy, obsługą koszyka, zamówień, ulubionych, JWT, nowoczesnym UI i pełną integracją backendu z frontendem. Projekt gotowy do rozbudowy o płatności, recenzje, powiadomienia i inne funkcje.
