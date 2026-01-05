"""
Test script to verify super-admin login
"""
import requests
import json

API_URL = "http://localhost:8000/api"

def test_super_admin_login():
    print("Testing Super Admin Login...")
    print("=" * 50)
    
    # Test login with super-admin credentials
    login_data = {
        "email": "superadmin@gmail.com",
        "password": "superadmin"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   Token: {data['token'][:50]}...")
            print(f"   User: {data['user']['name']}")
            print(f"   Email: {data['user']['email']}")
            print(f"   Role: {data['user']['role']}")
            
            if data['user']['role'] == 'super-admin':
                print("\n✅ Super-admin role confirmed!")
                return True
            else:
                print(f"\n❌ Expected role 'super-admin', got '{data['user']['role']}'")
                return False
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("   Make sure the backend server is running!")
        return False

def test_regular_user_registration():
    print("\n" + "=" * 50)
    print("Testing Regular User Registration...")
    print("=" * 50)
    
    # Test that new registrations are members
    register_data = {
        "name": "Test User",
        "email": f"testuser{hash('test')}@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register", json=register_data)
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            
            # Now login and check role
            login_response = requests.post(f"{API_URL}/auth/login", json={
                "email": register_data["email"],
                "password": register_data["password"]
            })
            
            if login_response.status_code == 200:
                user_data = login_response.json()['user']
                print(f"   User: {user_data['name']}")
                print(f"   Email: {user_data['email']}")
                print(f"   Role: {user_data['role']}")
                
                if user_data['role'] == 'member':
                    print("\n✅ Confirmed: New users are members by default!")
                    return True
                else:
                    print(f"\n❌ Expected role 'member', got '{user_data['role']}'")
                    return False
        else:
            print(f"❌ Registration failed: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🔐 RBAC System Test\n")
    
    test1 = test_super_admin_login()
    test2 = test_regular_user_registration()
    
    print("\n" + "=" * 50)
    print("Test Summary:")
    print("=" * 50)
    print(f"Super-admin login: {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"Member registration: {'✅ PASS' if test2 else '❌ FAIL'}")
    print()
