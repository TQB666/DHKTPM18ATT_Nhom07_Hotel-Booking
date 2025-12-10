package com.hotelbooking.hotel_booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelbooking.hotel_booking.domain.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    // Eager load Role để tránh lazy loading
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
    
    boolean existsByEmail(String email);
}
