package com.hotelbooking.hotel_booking.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hotelbooking.hotel_booking.domain.Facility;
import com.hotelbooking.hotel_booking.repository.FacilityRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class FacilityService {
    private final FacilityRepository FacilityRepository;


    public List<Facility> getAll(){
        return FacilityRepository.findAll();
    } 

    public Facility findById(Long id){
        return FacilityRepository.findById(id).get();
    }

    public Facility save(Facility tag){
        return FacilityRepository.save(tag);
    }

    public void delete(Facility tag){
        FacilityRepository.delete(tag);
    }

    public boolean existsByName(String name){
        return FacilityRepository.existsByName(name);
    }
}
