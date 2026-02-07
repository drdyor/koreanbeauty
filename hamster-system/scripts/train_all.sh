#!/bin/bash
# Train all hamster adapters sequentially
# This script runs the fine-tuning for all 6 hamsters

set -e

echo "🐹 Hamster System - Training All Adapters"
echo "=========================================="

# List of hamsters to train
HAMSTERS=("eriksonian" "adlerian" "behavioral" "cognitive" "business" "finance")

# Training parameters
EPOCHS=${1:-3}
BATCH_SIZE=${2:-4}
MODEL_ID=${3:-"mistralai/Mistral-7B-Instruct-v0.2"}

echo ""
echo "Training Configuration:"
echo "  Epochs: $EPOCHS"
echo "  Batch Size: $BATCH_SIZE"
echo "  Model: $MODEL_ID"
echo ""

# Track results
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_HAMSTERS=()

# Train each hamster
for HAMSTER in "${HAMSTERS[@]}"; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 Training: $HAMSTER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    START_TIME=$(date +%s)
    
    if python src/training/finetune_qlora.py \
        --hamster "$HAMSTER" \
        --epochs "$EPOCHS" \
        --batch-size "$BATCH_SIZE" \
        --model-id "$MODEL_ID"; then
        
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo ""
        echo "✅ $HAMSTER trained successfully (${DURATION}s)"
        ((SUCCESS_COUNT++))
    else
        echo ""
        echo "❌ $HAMSTER training failed"
        ((FAILED_COUNT++))
        FAILED_HAMSTERS+=("$HAMSTER")
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Training Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Successful: $SUCCESS_COUNT/${#HAMSTERS[@]}"
echo "  Failed: $FAILED_COUNT/${#HAMSTERS[@]}"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "❌ Failed hamsters:"
    for HAMSTER in "${FAILED_HAMSTERS[@]}"; do
        echo "    - $HAMSTER"
    done
    echo ""
    echo "To retry failed hamsters:"
    for HAMSTER in "${FAILED_HAMSTERS[@]}"; do
        echo "  python src/training/finetune_qlora.py --hamster $HAMSTER --epochs $EPOCHS"
    done
    exit 1
else
    echo ""
    echo "🎉 All hamsters trained successfully!"
    echo ""
    echo "Adapters saved in: adapters/"
    echo ""
    echo "Next steps:"
    echo "  1. Test the API: python src/api/app.py"
    echo "  2. Deploy: docker build -t hamster-system ."
fi
