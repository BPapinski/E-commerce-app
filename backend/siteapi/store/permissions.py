from rest_framework import permissions

class IsAdminOrSellerOrReadOnly(permissions.BasePermission):
    """
    Zezwala każdemu na odczyt (GET),
    ale edycję pozwala tylko właścicielowi (seller) lub administratorowi.
    """

    def has_object_permission(self, request, view, obj):
        # Dla metod tylko odczytu — GET, HEAD, OPTIONS — pozwalamy każdemu
        if request.method in permissions.SAFE_METHODS:
            return True

        # Dla edycji — pozwól tylko jeśli użytkownik to admin lub seller
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin or request.user == obj.seller)
        )