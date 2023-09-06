package com.pangolin.olap.web;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import mondrian.xmla.XmlaHandler;
import mondrian.xmla.impl.DefaultXmlaServlet;

@Component
public class XmlaServlet extends DefaultXmlaServlet {

    /**
     *
     */
    private static final long serialVersionUID = -5936114345252819877L;

    @Autowired
    private XmlaConnectionFactory connectionFactory;

    @Override
    protected XmlaHandler.ConnectionFactory createConnectionFactory(ServletConfig servletConfig)
            throws ServletException {
        return connectionFactory;
    }

}
