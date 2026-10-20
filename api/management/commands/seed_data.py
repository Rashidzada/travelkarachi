from django.core.management.base import BaseCommand
from api.seed import ensure_seed_data


class Command(BaseCommand):
    help = 'Seed initial AeroDesk Travel Karachi database records'

    def handle(self, *args, **options):
        ensure_seed_data()
        self.stdout.write(self.style.SUCCESS('Successfully seeded AeroDesk Travel Karachi database!'))
