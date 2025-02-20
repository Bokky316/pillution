package com.javalab.student.dto.Subscription;

import com.javalab.student.entity.subscription.SubscriptionItem;
import lombok.Getter;

@Getter
public class SubscriptionItemDto {
    private String productName;
    private int quantity;
    private double price;

    public SubscriptionItemDto(SubscriptionItem item) {
        this.productName = item.getProduct().getName();
        this.quantity = item.getQuantity();
        this.price = item.getPrice();
    }
}
