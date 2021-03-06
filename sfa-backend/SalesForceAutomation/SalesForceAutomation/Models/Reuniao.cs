﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace SalesForceAutomation.Models
{
    public class Reuniao
    {
        public string CodReuniao
        {
            get;
            set;
        }

        public string CodVendedor
        {
            get;
            set;
        }

        public string Descricao
        {
            get;
            set;
        }

        public DateTime DataInicio
        {
            get;
            set;
        }

        public DateTime DataFim
        {
            get;
            set;
        }

        public string Prioridade
        {
            get;
            set;
        }

        public string Notas
        {
            get;
            set;    
        }

        public bool TodoDia
        {
            get;
            set;
        }

        public int Duracao
        {
            get;
            set;
        }

        public string Entidade
        {
            get;
            set;
        }

        public string Oportunidade
        {
            get;
            set;
        }

        public string Tipo
        {
            get;
            set;
        }

        public string TipoId
        {
            get;
            set;
        }
    }
}
