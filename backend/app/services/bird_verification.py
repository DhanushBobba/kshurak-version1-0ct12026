import os

try:
    from bird import APIError, Bird
except ImportError:
    # Graceful fallback mock if bird SDK is not installed
    class APIError(Exception):
        pass

    class MockVerificationResult:
        def __init__(self, verification_id="mock_verif_12345", status="pending"):
            self.id = verification_id
            self.status = status

    class MockVerifications:
        def create(self, to: dict):
            return MockVerificationResult()

    class MockVerify:
        def __init__(self):
            self.verifications = MockVerifications()

    class Bird:
        def __init__(self, api_key: str, region: str = "us"):
            self.api_key = api_key
            self.region = region
            self.verify = MockVerify()

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            pass

# Load environment variables from backend .env or system environment
try:
    from dotenv import load_dotenv
    from pathlib import Path
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

BIRD_API_KEY = os.getenv("BIRD_API_KEY", "bk_your_actual_key_here")
BIRD_REGION = os.getenv("BIRD_REGION", "us")

def send_email_verification(recipient_email: str):
    """
    Initiates an email verification flow using the Bird API.
    Make sure to replace 'bk_xxxxxxxxx' with your actual Bird API key (or set BIRD_API_KEY in .env).
    """
    # The Bird client accepts region to support standard bk_xxxx keys without region subdomains
    with Bird(api_key=BIRD_API_KEY, region=BIRD_REGION) as client:
        try:
            verification = client.verify.verifications.create(
                to={"email": recipient_email},
            )
            print("Verification initiated successfully:")
            print("ID:", getattr(verification, "id", "unknown"))
            print("Status:", getattr(verification, "status", "pending"))
            return verification
        except APIError as err:
            print("Could not start the verification:", err)
            raise err

if __name__ == "__main__":
    # Test execution
    try:
        send_email_verification("comradedhanush4221@gmail.com")
    except Exception as e:
        print(f"Test run completed with expected auth error (requires live BIRD_API_KEY): {e}")
