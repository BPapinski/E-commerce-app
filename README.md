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
- ✅ Koszyk zakupowy (w trakcie tworzenia)
- ✅ Proces składania zamówienia (w trakcie tworzenia)
- ✅ Panel administratora do zarządzania sklepem
- ✅ System ocen i recenzji produktów (w trakcie tworzenia)
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
