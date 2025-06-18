# D:\CSS\Projects\ecommerce-app\backend\siteapi\conftest.py
import sys
import os

# Ta linia nie będzie potrzebna, jeśli uruchamiasz z siteapi
# i wszystkie importy są względne do siteapi lub w site-packages
# sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Jeśli masz testy, które muszą zaimportować coś z 'backend' (folderu nadrzędnego),
# np. z innej aplikacji obok siteapi, wtedy potrzebujesz tej linii:
# parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
# sys.path.insert(0, parent_dir)

print("\n--- Debug PYTHONPATH w conftest.py (w siteapi) ---")
print(f"Bieżący katalog (os.getcwd()): {os.getcwd()}")
print("PYTHONPATH zawiera:")
for path in sys.path:
    print("   →", path)
print("--------------------------------------\n")

try:
    import siteapi.settings
    print("✅ Udało się zaimportować siteapi.settings!")
except ImportError as e:
    print("❌ NIE udało się zaimportować siteapi.settings:", e)