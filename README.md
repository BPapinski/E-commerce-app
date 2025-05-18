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
- Zarządzanie stanem z React Context / Redux (opcjonalnie)
- Integracja z backendem przez REST API
- System routingowy (React Router)
- Responsywny design (Tailwind / Bootstrap / własny CSS)

---

## ⚙️ Funkcjonalności

- ✅ Rejestracja i logowanie użytkownika
- ✅ Przeglądanie produktów i kategorii
- ✅ Koszyk zakupowy
- ✅ Proces składania zamówienia
- ✅ Integracja z systemem płatności (np. Stripe)
- ✅ Panel administratora do zarządzania sklepem
- ✅ System ocen i recenzji produktów
- ✅ Filtry i wyszukiwarka

---

## 🚀 Uruchomienie projektu lokalnie

### Backend (Django)

```bash
# Stwórz i aktywuj środowisko wirtualne
python -m venv venv
source venv/bin/activate  # lub venv\Scripts\activate na Windows

# Instalacja zależności
pip install -r requirements.txt

# Migracje bazy danych i uruchomienie serwera
python manage.py migrate
python manage.py runserver

# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm start
