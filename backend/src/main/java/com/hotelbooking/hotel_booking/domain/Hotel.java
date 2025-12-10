package com.hotelbooking.hotel_booking.domain;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hotels")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private String address;

    private String phone;

    private int rating;//1-5
    
    @Column(columnDefinition = "MEDIUMTEXT")
    private String detailDesc;

    private String shortDesc;

    private String image;

    private String city;

    private String status; // ACTIVE, UNAVAILABLE

    @OneToMany(mappedBy = "hotel")
    Set<Room> rooms;

    @OneToMany(mappedBy = "hotel")
    Set<Tag> tags;

    @ManyToMany
    @JoinTable(
        name = "hotel_facility",
        joinColumns = @JoinColumn(name = "hotel_id"),
        inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    private Set<Facility> facilities;

    @OneToMany(mappedBy = "hotel")
    Set<Review> reviews;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> images;
}
