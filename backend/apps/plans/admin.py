from django.contrib import admin
from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'currency', 'max_users', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('General Information', {
            'fields': ('name', 'status')
        }),
        ('Pricing', {
            'fields': ('price', 'currency')
        }),
        ('Plan Details', {
            'fields': ('max_users', 'features')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
