from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Patient, Pharmacy

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for Cypress testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing test users before creating new ones',
        )

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('\n🔧 Creating test users for Cypress...'))
            
            if options['reset']:
                deleted_count = User.objects.filter(
                    email__in=['patient@test.com', 'pharmacy@test.com']
                ).delete()[0]
                self.stdout.write(self.style.WARNING(f'🗑️  Deleted {deleted_count} existing test users'))

            # Create Patient Test User
            self.stdout.write(self.style.SUCCESS('\n📝 Creating Patient...'))
            patient_email = 'patient@test.com'
            if not User.objects.filter(email=patient_email).exists():
                patient_user = User.objects.create_user(
                    username='testpatient',
                    email=patient_email,
                    password='password123',
                    user_type='patient',
                    is_active=True
                )
                # Get actual Patient model fields
                patient_fields = {f.name for f in Patient._meta.fields}
                
                patient_data = {
                    'user': patient_user,
                    'name': 'Test Patient',
                    'date_of_birth': '1990-01-01',
                }
                
                # Add optional fields only if they exist
                if 'phone' in patient_fields:
                    patient_data['phone'] = '+1234567890'
                if 'address' in patient_fields:
                    patient_data['address'] = '123 Test Street'
                    
                Patient.objects.create(**patient_data)
                self.stdout.write(self.style.SUCCESS(f'✅ Created patient: {patient_email}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️  Patient already exists: {patient_email}'))

            # Create Pharmacy Test User
            self.stdout.write(self.style.SUCCESS('\n📝 Creating Pharmacy...'))
            pharmacy_email = 'pharmacy@test.com'
            if not User.objects.filter(email=pharmacy_email).exists():
                pharmacy_user = User.objects.create_user(
                    username='testpharmacy',
                    email=pharmacy_email,
                    password='password123',
                    user_type='pharmacy',
                    is_active=True
                )
                
                # Get actual Pharmacy model fields
                pharmacy_fields = {f.name for f in Pharmacy._meta.fields}
                
                pharmacy_data = {
                    'user': pharmacy_user,
                    'name': 'Test Pharmacy',
                    'license_number': 'PH123456',
                    'is_verified': True
                }
                
                # Add optional fields only if they exist
                if 'phone' in pharmacy_fields:
                    pharmacy_data['phone'] = '+1234567891'
                if 'address' in pharmacy_fields:
                    pharmacy_data['address'] = '456 Pharmacy Ave'
                    
                Pharmacy.objects.create(**pharmacy_data)
                self.stdout.write(self.style.SUCCESS(f'✅ Created pharmacy: {pharmacy_email}'))
            else:
                # Ensure existing pharmacy is verified
                pharmacy_user = User.objects.get(email=pharmacy_email)
                try:
                    pharmacy = Pharmacy.objects.get(user=pharmacy_user)
                    if not pharmacy.is_verified:
                        pharmacy.is_verified = True
                        pharmacy.save()
                        self.stdout.write(self.style.SUCCESS(f'✅ Verified pharmacy: {pharmacy_email}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'⚠️  Pharmacy already exists and verified: {pharmacy_email}'))
                except Pharmacy.DoesNotExist:
                    pharmacy_fields = {f.name for f in Pharmacy._meta.fields}
                    pharmacy_data = {
                        'user': pharmacy_user,
                        'name': 'Test Pharmacy',
                        'license_number': 'PH123456',
                        'is_verified': True
                    }
                    if 'phone' in pharmacy_fields:
                        pharmacy_data['phone'] = '+1234567891'
                    if 'address' in pharmacy_fields:
                        pharmacy_data['address'] = '456 Pharmacy Ave'
                    Pharmacy.objects.create(**pharmacy_data)
                    self.stdout.write(self.style.SUCCESS(f'✅ Created pharmacy profile: {pharmacy_email}'))

            self.stdout.write(self.style.SUCCESS('\n✅ Test users setup complete!'))
            self.stdout.write(self.style.SUCCESS('\n📝 Test Credentials:'))
            self.stdout.write(self.style.SUCCESS('   Patient: patient@test.com / password123'))
            self.stdout.write(self.style.SUCCESS('   Pharmacy: pharmacy@test.com / password123'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise