package com.javalab.student.entity.cartOrder;

import com.javalab.student.entity.BaseEntity;
import com.javalab.student.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * 장바구니 정보를 담는 엔티티 클래스.
 * 사용자의 장바구니와 관련된 상품 목록을 관리합니다.
 */
@Entity
@Table(name = "cart")
@Getter
@Setter
@ToString(exclude = "cartItems")
public class Cart extends BaseEntity {

    /** 장바구니 ID, Primary Key */
    @Id
    @Column(name = "cart_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 회원, OneToOne 관계 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    /** 장바구니 아이템 목록, OneToMany 관계 */
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();

    /**
     * 카트 생성 메소드
     *
     * @param member 회원
     * @return 생성된 Cart 객체
     */
    public static Cart createCart(Member member) {
        Cart cart = new Cart();
        cart.setMember(member);
        return cart;
    }

    /**
     * 장바구니 아이템 추가 메소드
     *
     * @param cartItem 장바구니 아이템
     */
    public void addCartItem(CartItem cartItem) {
        cartItems.add(cartItem);
        cartItem.setCart(this);
    }
}
