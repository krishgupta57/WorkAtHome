from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import ServiceCategory, WorkerProfile, CustomerProfile, BookingSlot
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with default service categories, users, workers, and slots.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1. Create Service Categories
        categories_data = [
            {"name": "Electrician", "icon": "zap", "description": "Expert electrical repairs, wiring, and installations"},
            {"name": "Plumber", "icon": "droplet", "description": "Leak detection, pipe repairs, plumbing installations"},
            {"name": "Carpenter", "icon": "hammer", "description": "Furniture repairs, assembly, and wooden work"},
            {"name": "Painter", "icon": "brush", "description": "Professional home painting and wall touch-ups"},
            {"name": "Welder", "icon": "anvil", "description": "Expert metal welding, gate repair, and fabrications"},
            {"name": "Sweeper", "icon": "wind", "description": "Professional sweeping and general cleaning"},
            {"name": "Labor", "icon": "users", "description": "General manual labor and heavy lifting support"},
            {"name": "Personal Maid", "icon": "heart", "description": "Dedicated daily helper for household chores"},
            {"name": "Home Cleaning", "icon": "sparkles", "description": "Complete deep cleaning for houses and apartments"},
            {"name": "AC Repair", "icon": "snowflake", "description": "Air conditioner servicing, repair, and gas refilling"},
            {"name": "Appliance Repair", "icon": "tv", "description": "Repairs for refrigerators, washing machines, and appliances"},
            {"name": "Gardener", "icon": "leaf", "description": "Lawn mowing, pruning, and professional garden care"},
            {"name": "Tile Worker", "icon": "grid", "description": "Premium floor tiles installation and repair"},
            {"name": "Plaster Worker", "icon": "layers", "description": "Smooth wall plastering and cement repairs"},
            {"name": "Security Guard", "icon": "shield", "description": "Trusted residential and commercial security guards"},
            {"name": "Driver", "icon": "car", "description": "Professional and safe driver for personal or office cars"},
        ]

        categories = {}
        for cat in categories_data:
            obj, created = ServiceCategory.objects.get_or_create(
                name=cat["name"],
                defaults={"icon": cat["icon"], "description": cat["description"]}
            )
            categories[cat["name"]] = obj
            if created:
                self.stdout.write(f"Category '{cat['name']}' created.")

        # 2. Create Admin User
        admin_user, created = User.objects.get_or_create(
            email="admin@workathome.com",
            defaults={
                "username": "admin",
                "name": "Super Admin",
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write("Admin user 'admin@workathome.com' (password: admin123) created.")

        # 3. Create Customers
        customers_data = [
            {"email": "john@gmail.com", "username": "john", "name": "John Doe", "phone": "+919876543210"},
            {"email": "emily@gmail.com", "username": "emily", "name": "Emily Watson", "phone": "+919876543211"},
            {"email": "rahul@gmail.com", "username": "rahul", "name": "Rahul Sharma", "phone": "+919876543212"},
        ]

        for cust in customers_data:
            user, u_created = User.objects.get_or_create(
                email=cust["email"],
                defaults={
                    "username": cust["username"],
                    "name": cust["name"],
                    "role": "CUSTOMER",
                    "is_verified": True
                }
            )
            if u_created:
                user.set_password("user123")
                user.save()
                CustomerProfile.objects.get_or_create(
                    user=user,
                    defaults={"phone": cust["phone"], "profile_picture": f"https://api.dicebear.com/7.x/adventurer/svg?seed={cust['username']}"}
                )
                self.stdout.write(f"Customer '{cust['name']}' created.")

        # 4. Create Workers
        workers_data = [
            {
                "email": "alex@gmail.com", "username": "alex", "name": "Alex Mercer", 
                "phone": "+918888888881", "skills": ["Electrician", "AC Repair"], 
                "bio": "Experienced electrician with 8+ years of expertise. Certified in industrial and residential electrical installations.",
                "rate": 350.00, "exp": 8, "badge": True, "rating": 4.8
            },
            {
                "email": "sarah@gmail.com", "username": "sarah", "name": "Sarah Connor", 
                "phone": "+918888888882", "skills": ["Plumber"], 
                "bio": "Expert in pipe leakage detection, kitchen fixture styling, and complete home drainage overhaul.",
                "rate": 280.00, "exp": 5, "badge": True, "rating": 4.6
            },
            {
                "email": "david@gmail.com", "username": "david", "name": "David Miller", 
                "phone": "+918888888883", "skills": ["Home Cleaning", "Sweeper"], 
                "bio": "Professional home deep-cleaning specialist. Guaranteed spot-free kitchens, washrooms, and lawns.",
                "rate": 450.00, "exp": 4, "badge": False, "rating": 4.3
            },
            {
                "email": "james@gmail.com", "username": "james", "name": "James Porter", 
                "phone": "+918888888884", "skills": ["Driver"], 
                "bio": "Safe, reliable, and verified personal chauffeur. Expert in highway driving and luxury cars.",
                "rate": 500.00, "exp": 10, "badge": True, "rating": 4.9
            },
        ]

        for wrk in workers_data:
            user, u_created = User.objects.get_or_create(
                email=wrk["email"],
                defaults={
                    "username": wrk["username"],
                    "name": wrk["name"],
                    "role": "WORKER",
                    "is_verified": True
                }
            )
            if u_created:
                user.set_password("worker123")
                user.save()
                
                profile, p_created = WorkerProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "phone": wrk["phone"],
                        "skills": wrk["skills"],
                        "bio": wrk["bio"],
                        "base_hourly_rate": wrk["rate"],
                        "experience_years": wrk["exp"],
                        "verification_badge": wrk["badge"],
                        "average_rating": wrk["rating"],
                        "profile_picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={wrk['username']}"
                    }
                )
                self.stdout.write(f"Worker '{wrk['name']}' created.")

                # Seed available booking slots for this worker (Today & Tomorrow)
                today = datetime.date.today()
                tomorrow = today + datetime.timedelta(days=1)
                
                times = [
                    ("09:00:00", "10:00:00"),
                    ("10:00:00", "11:00:00"),
                    ("11:00:00", "12:00:00"),
                    ("14:00:00", "15:00:00"),
                    ("15:00:00", "16:00:00"),
                    ("16:00:00", "17:00:00"),
                ]
                
                for day in [today, tomorrow]:
                    for start, end in times:
                        BookingSlot.objects.get_or_create(
                            worker=profile,
                            date=day,
                            start_time=start,
                            end_time=end,
                            defaults={"is_booked": False}
                        )
                self.stdout.write(f"Created slots for '{wrk['name']}' for today and tomorrow.")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
