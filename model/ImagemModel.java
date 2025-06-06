 package com.bancoimagens.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.websocket.Decoder.Text;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@Entity
@Table(name = "imagens" )
public class ImagemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String nome;
    @Column
    private Text url;

}