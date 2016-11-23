﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace SalesForceAutomation.Controllers
{
    public class ReuniaoController : ApiController
    {

        // GET /Reuniao/

        public IEnumerable<Models.Reuniao> Get()
        {
            return Lib_Primavera.PriIntegration.get_all_meetings();
        }

        // GET /Reuniao/:id
        public Models.Reuniao Get(string id)
        {
            Models.Reuniao reuniao = Lib_Primavera.PriIntegration.GetReuniao(id);
            if (reuniao == null)
            {
                throw new HttpResponseException(
                  Request.CreateResponse(HttpStatusCode.NotFound));
            }
            else
            {
                return reuniao;
            }
        }


    }
}
