from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    label = 'core'

    def ready(self):
        """
        At Django startup:
        Globally patch rest_framework.serializers.ModelSerializer.get_fields
        to make 'tenant', 'tenant_id', and 'is_deleted' read-only on all tenant-scoped models.
        """
        try:
            from rest_framework import serializers
            original_get_fields = serializers.ModelSerializer.get_fields

            def get_fields_patched(self_serializer):
                fields = original_get_fields(self_serializer)
                if hasattr(self_serializer, 'Meta') and hasattr(self_serializer.Meta, 'model'):
                    model = self_serializer.Meta.model
                    # If it's a tenant-scoped model, enforce read-only on tenant/is_deleted
                    has_tenant = hasattr(model, 'tenant') or hasattr(model, 'tenant_id')
                    if has_tenant:
                        if 'tenant' in fields:
                            fields['tenant'].read_only = True
                        if 'tenant_id' in fields:
                            fields['tenant_id'].read_only = True
                        if 'is_deleted' in fields:
                            fields['is_deleted'].read_only = True
                return fields

            serializers.ModelSerializer.get_fields = get_fields_patched
        except ImportError:
            pass

