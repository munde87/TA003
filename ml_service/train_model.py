# File: ml_service/train_model.py
# Run standalone to test the ML model

from models.classifier import ProductClassifier

def main():
    print("=" * 60)
    print("   SHOPMART — ML MODEL TRAINING & TESTING")
    print("=" * 60)

    clf = ProductClassifier()
    accuracy = clf.train()

    print(f"\n✅ Model trained!")
    print(f"📊 Accuracy: {accuracy:.2%}")
    print(f"📂 Categories: {clf.categories}\n")

    # ── Test Products ──
    tests = [
        "milk", "wire", "bread", "paracetamol", "hammer",
        "paneer", "LED bulb", "rice", "screwdriver", "cake",
        "phone charger", "shirt", "pen", "tomato", "cough syrup",
        "butter", "nails", "eraser", "banana", "switch board",
        "cheese", "ceiling fan", "aspirin", "door lock", "cookies",
        "laptop", "jeans", "notebook", "onion", "ghee",
        "extension board", "bandage", "paint", "muffin", "earphone"
    ]

    print(f"{'PRODUCT':<22} {'PREDICTED':<15} {'CONFIDENCE':<12} {'STATUS'}")
    print("-" * 60)

    correct = 0
    for product in tests:
        result = clf.predict(product)
        conf = result['confidence']
        status = "✅" if conf > 0.6 else "⚠️" if conf > 0.3 else "❌"
        if conf > 0.5:
            correct += 1
        print(f"{product:<22} {result['predicted_category']:<15} {conf:>8.1%}     {status}")

    print(f"\n📈 Test Accuracy: {correct}/{len(tests)} = {correct/len(tests):.0%}")
    print(f"\n💡 Run 'python main.py' to start the API server")
    print(f"💡 Then open http://localhost:8000 in your browser\n")


if __name__ == "__main__":
    main()